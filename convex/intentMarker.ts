import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

const BATCH_SIZE = 40;

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
          if (unscored.length > BATCH_SIZE) break; // one extra = "has more"
        }
      }
      if (!unscored.length) continue;

      const items = [];
      for (const match of unscored.slice(0, BATCH_SIZE)) {
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
        hasMore: unscored.length > BATCH_SIZE,
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

export const scoreDue = internalAction({
  args: {},
  handler: async (ctx): Promise<{ scored: number; more: boolean } | { skipped: string }> => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { skipped: "OPENAI_API_KEY not set on this deployment" };

    const batch = await ctx.runQuery(internal.intentMarker.nextBatch, {});
    if (!batch || !batch.items.length) return { scored: 0, more: false };

    const model = process.env.OPENAI_MODEL ?? "gpt-5-mini";
    // The model echoes short indexes, not raw ids: nothing for it to mangle.
    const user = JSON.stringify({
      product: batch.product,
      posts: batch.items.map((item, index) => ({
        id: String(index),
        platform: item.platform,
        community: item.community,
        title: item.title,
        text: item.snippet,
      })),
    });

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
    if (!res.ok) {
      // Leave the batch unscored; the sweeper retries it.
      throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content) as {
      scores: Array<{ id: string; intent: string; reason: string }>;
    };

    const scores = [];
    for (const score of parsed.scores) {
      const index = Number(score.id);
      const item = Number.isInteger(index) ? batch.items[index] : undefined;
      if (!item) continue; // index the model invented
      scores.push({
        matchId: item.matchId,
        intent: score.intent,
        reason: score.reason,
      });
    }
    const applied: number = await ctx.runMutation(internal.intentMarker.applyScores, {
      scores,
      allowedIds: batch.items.map((item) => item.matchId),
    });

    if (batch.hasMore) {
      await ctx.scheduler.runAfter(0, internal.intentMarker.scoreDue, {});
    }
    return { scored: applied, more: batch.hasMore };
  },
});
