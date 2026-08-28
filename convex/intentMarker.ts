import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

const BATCH_SIZE = 40;
// Batches go out together rather than one after another. 40 is the size the
// model stays reliable at, so scale comes from running more of them at once.
const CONCURRENCY = 10;
const POOL = BATCH_SIZE * CONCURRENCY;

// ---------- queue: unscored matches, one project per batch ----------

export const nextBatch = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Small scale: walk projects and take the first with unscored matches.
    // Revisit with an index once matches stop fitting in a scan.
    for (const project of await ctx.db.query("projects").collect()) {
      const unscored = [];
      for await (const match of ctx.db
        .query("matches")
        .withIndex("by_project_posted", (q) => q.eq("projectId", project._id))
        .order("desc")) {
        if (match.intentScore === undefined) {
          unscored.push(match);
          if (unscored.length > POOL) break; // one extra = "has more"
        }
      }
      if (!unscored.length) continue;

      const items = [];
      for (const match of unscored.slice(0, POOL)) {
        const post = await ctx.db.get(match.postId);
        if (!post) continue;
        items.push({
          matchId: match._id,
          title: post.title,
          snippet:
            post.type === "comment" && post.parentTitle
              ? `[comment on: ${post.parentTitle}] ${post.snippet ?? ""}`
              : (post.snippet ?? ""),
          platform: post.platform,
          community: post.subsource ?? "",
        });
      }
      return {
        projectId: project._id,
        product: `${project.name}: ${project.description || "no description yet"}`,
        items,
        hasMore: unscored.length > POOL,
      };
    }
    return null;
  },
});

export const applyScores = internalMutation({
  args: {
    scores: v.array(
      v.object({
        matchId: v.id("matches"),
        intent: v.string(),
        reason: v.string(),
      }),
    ),
    allowedIds: v.array(v.id("matches")),
  },
  handler: async (ctx, args) => {
    const allowed = new Set(args.allowedIds);
    let applied = 0;
    for (const score of args.scores) {
      if (!allowed.has(score.matchId)) continue; // model invented an id
      if (!["high", "medium", "low"].includes(score.intent)) continue;
      const match = await ctx.db.get(score.matchId);
      if (!match || match.intentScore !== undefined) continue;
      await ctx.db.patch(score.matchId, {
        intentScore: score.intent,
        intentReason: score.reason.slice(0, 300),
      });
      applied++;
    }
    return applied;
  },
});

// Clear scores so they get judged again, after a prompt or model change:
//   npx convex run intentMarker:unscore '{"limit":200}' --prod
export const unscore = internalMutation({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    let cleared = 0;
    for await (const match of ctx.db.query("matches")) {
      if (cleared >= limit) break;
      if (match.intentScore === undefined) continue;
      await ctx.db.patch(match._id, {
        intentScore: undefined,
        intentReason: undefined,
      });
      cleared++;
    }
    return cleared;
  },
});

// ---------- the scorer ----------

const RESPONSE_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "intent_scores",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["scores"],
      properties: {
        scores: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "intent", "reason"],
            properties: {
              id: { type: "string" },
              intent: { type: "string", enum: ["high", "medium", "low"] },
              reason: { type: "string" },
            },
          },
        },
      },
    },
  },
} as const;

const SYSTEM_PROMPT = `You score social media posts for reply marketing: a founder replies to posts where their product is genuinely useful to the author.

For each post, relative to the product described, return:
- "high": the author has, right now, the problem this product solves - asking for recommendations, complaining about an alternative, or describing the pain in their own words. A helpful reply could plausibly win them.
- "medium": related conversation (adjacent product launch, discussion of the space, the audience fits) where a thoughtful reply builds credibility but likely not an immediate customer.
- "low": unrelated, or a reply would be spam. When unsure, choose low.

Watch for these traps:
- A comment or reply praising or anticipating some OTHER product ("can't wait", "this looks great", "I've been looking for this") is directed at that product, not at ours. That is low, not high.
- A post whose author is building or launching something related to the product's space is a genuine opportunity (the reply is made on that post, to its audience) - usually medium.

reason: one short sentence, for the founder, on why this post is or is not worth replying to.

Return one entry per post, echoing the exact id you were given for it.`;

type BatchItem = {
  matchId: string;
  title: string;
  snippet: string;
  platform: string;
  community: string;
};

type Scored = { matchId: any; intent: string; reason: string };

// Rate limits bite on tokens per minute, not requests, so ten batches landing
// at once can get a 429 even though nothing is wrong. Back off and retry
// rather than dropping the batch on the sweeper.
const RETRY_DELAYS_MS = [1000, 4000, 10000];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scoreChunk(
  apiKey: string,
  model: string,
  product: string,
  items: BatchItem[],
): Promise<Scored[]> {
  // The model echoes short indexes, not raw ids: nothing for it to mangle.
  const user = JSON.stringify({
    product,
    posts: items.map((item, index) => ({
      id: String(index),
      platform: item.platform,
      community: item.community,
      title: item.title,
      text: item.snippet,
    })),
  });

  let body: string | null = null;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const last = attempt === RETRY_DELAYS_MS.length;
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: user },
          ],
          response_format: RESPONSE_SCHEMA,
        }),
      });

      if (res.ok) {
        body = await res.text();
        break;
      }

      const retryable = res.status === 429 || res.status >= 500;
      const detail = (await res.text()).slice(0, 200);
      if (!retryable || last) {
        // Leave this chunk unscored; the sweeper picks it up again.
        console.error(`OpenAI ${res.status}: ${detail}`);
        return [];
      }
    } catch (err) {
      // Network-level failure, which is exactly what the retries are for.
      if (last) {
        console.error(`OpenAI request failed: ${String(err).slice(0, 200)}`);
        return [];
      }
    }
    await sleep(RETRY_DELAYS_MS[attempt]);
  }
  if (!body) return [];

  const data = JSON.parse(body);
  const parsed = JSON.parse(data.choices[0].message.content) as {
    scores: Array<{ id: string; intent: string; reason: string }>;
  };

  const scores: Scored[] = [];
  for (const score of parsed.scores) {
    const index = Number(score.id);
    const item = Number.isInteger(index) ? items[index] : undefined;
    if (!item) continue; // index the model invented
    scores.push({
      matchId: item.matchId,
      intent: score.intent,
      reason: score.reason,
    });
  }
  return scores;
}

export const scoreDue = internalAction({
  args: {},
  handler: async (ctx): Promise<{ scored: number; more: boolean } | { skipped: string }> => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { skipped: "OPENAI_API_KEY not set on this deployment" };

    const batch = await ctx.runQuery(internal.intentMarker.nextBatch, {});
    if (!batch || !batch.items.length) return { scored: 0, more: false };

    const model = process.env.OPENAI_MODEL ?? "gpt-5-mini";

    const chunks: BatchItem[][] = [];
    for (let i = 0; i < batch.items.length; i += BATCH_SIZE) {
      chunks.push(batch.items.slice(i, i + BATCH_SIZE) as BatchItem[]);
    }

    // All chunks go out together; one failing does not take the others down.
    const results = await Promise.all(
      chunks.map((chunk) =>
        scoreChunk(apiKey, model, batch.product, chunk).catch((err) => {
          console.error(err);
          return [] as Scored[];
        }),
      ),
    );

    const applied: number = await ctx.runMutation(internal.intentMarker.applyScores, {
      scores: results.flat(),
      allowedIds: batch.items.map((item) => item.matchId),
    });

    if (batch.hasMore) {
      await ctx.scheduler.runAfter(0, internal.intentMarker.scoreDue, {});
    }
    return { scored: applied, more: batch.hasMore };
  },
});
