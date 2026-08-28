import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { PROJECT_LINK_LABEL } from "./links";
import { SUBREDDIT_CATALOG } from "../lib/subreddit-catalog";

// How people actually talk in each place. Same post, same product, different
// reply: what reads as helpful on Reddit reads as fluff on Hacker News.
const PLATFORM_VOICE: Record<string, { how: string; words: number }> = {
  hn: {
    how: "Hacker News. Say the one thing you actually know from doing it. Understated, specific, no enthusiasm words, no emoji.",
    words: 45,
  },
  reddit: {
    how: "Reddit. Talk like a person in the thread. Open with the thing that was actually annoying about this for you, then the one thing that helped. Contractions, plain words, a bit blunt is fine.",
    words: 50,
  },
  indiehackers: {
    how: "Indie Hackers. Founder to founder. One specific thing that worked or did not, numbers if you have them.",
    words: 40,
  },
  bluesky: { how: "Bluesky. Casual, offhand, like a quick reply between other things.", words: 25 },
  github: { how: "GitHub. Answer the question and nothing else. No pleasantries.", words: 35 },
  youtube: { how: "YouTube comment. Friendly, simple, the way people actually comment.", words: 20 },
  x: { how: "X. One thought, said fast. No thread, no hashtags.", words: 20 },
  linkedin: {
    how: "LinkedIn. Warm and normal. No LinkedIn voice: nothing is thrilling, nothing is a game changer, no line breaks for drama.",
    words: 45,
  },
};

const RULES = `How to write it:
- SAY ONE THING. Real people reply with the single thing they know, not a survey of the options. Never list two or three alternatives with tradeoffs. Pick the one you would actually do and say it.
- Do not try to be complete, balanced or helpful in every direction. Leaving things out is what makes it read like a person.
- No opening summary of their situation and no general principle. Start on the actual point. Never begin with "the best way", "it depends", "one common approach", "it sounds like", "I can relate".
- Help first. The reply has to be worth reading even if the product is never mentioned.
- Mention the product once, by name, in the sentence where it belongs, and only if it honestly answers what they asked. If it does not, say your one useful thing and mention nothing. Mentioning nothing is a good outcome.
- Saying you built it is fine, and usually the most honest way in. What is not fine is asking them to try it, "check it out", "give it a go", or explaining what the product does beyond one short clause.
- Two or three sentences is the target. Four is already too many.
- Put the link in exactly once, right after the name, only when you mention it. Use the link given to you verbatim, never the product name as a domain, never a made up url. If the platform is x, leave the link out entirely.
- No em dashes anywhere. Use commas or full stops.
- No greeting, no sign off, no headings, no bullet points, no bold. Plain sentences.
- Write the way someone types a reply on their phone between other work. Short sentences are fine. Fragments are fine.

Return only the reply text.`;

// Model output still slips an em dash in now and then, so it never ships.
function stripEmDashes(text: string): string {
  return text
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s*–\s*/g, ", ")
    .replace(/\s+([,.])/g, "$1")
    .trim();
}

export const context = internalQuery({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);
    if (!match) return null;
    const post = await ctx.db.get(match.postId);
    const project = await ctx.db.get(match.projectId);
    if (!post || !project) return null;

    // Hand the writer the tracked link rather than the bare URL, so a click
    // from the reply shows up in analytics with the platform it came from.
    const site = process.env.SITE_URL?.replace(/\/$/, "");
    const links = await ctx.db
      .query("trackedLinks")
      .withIndex("by_project", (q) => q.eq("projectId", match.projectId))
      .collect();
    const tracked = links.find((l) => l.label === PROJECT_LINK_LABEL);
    const link =
      site && tracked ? `${site}/r/${tracked.code}` : (project.url ?? "");

    // Community rules matter: the same sentence is fine in one subreddit and
    // a ban in another.
    const community = post.subsource?.replace(/^r\//, "").toLowerCase();
    const entry = SUBREDDIT_CATALOG.find((row) => row.name === community);

    return {
      ownerClerkId: match.ownerClerkId,
      alreadyDrafted: match.draft,
      platform: post.platform,
      post: {
        title: post.title,
        body: post.snippet ?? "",
        community: post.subsource ?? "",
        author: post.author ?? "",
        parentTitle: post.parentTitle ?? "",
        isComment: post.type === "comment",
      },
      selfPromo: entry?.selfPromo ?? "",
      product: {
        name: project.name,
        link,
        description: project.description ?? "",
      },
    };
  },
});

export const save = internalMutation({
  args: { matchId: v.id("matches"), draft: v.string(), model: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.matchId, {
      draft: args.draft,
      draftedAt: Date.now(),
      draftModel: args.model,
    });
  },
});

export const generate = internalAction({
  args: { matchId: v.id("matches"), force: v.optional(v.boolean()) },
  handler: async (ctx, args): Promise<{ draft: string } | { error: string }> => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { error: "OPENAI_API_KEY not set on this deployment" };

    const info = await ctx.runQuery(internal.replyDrafter.context, {
      matchId: args.matchId,
    });
    if (!info) return { error: "no such match" };
    if (info.alreadyDrafted && !args.force) return { draft: info.alreadyDrafted };
    // Without a description the model has nothing true to say about the
    // product, and it will make something up rather than stay quiet.
    if (!info.product.description.trim()) {
      return { error: "Add a product description in project settings first" };
    }

    const model = process.env.OPENAI_DRAFT_MODEL ?? "gpt-5-mini";
    const voice = PLATFORM_VOICE[info.platform] ?? PLATFORM_VOICE.reddit;

    const system = `You write replies for a founder who answers posts where their product is genuinely relevant. You are writing as the founder, in first person.

${voice.how}

Hard limit: ${voice.words} words. Under is better. A short reply that says one real thing beats a thorough one every time.

${RULES}`;

    const user = JSON.stringify({
      product: info.product,
      post: info.post,
      communitySelfPromoRule: info.selfPromo,
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
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      return { error: `OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}` };
    }

    const data = await res.json();
    const draft = stripEmDashes(data.choices?.[0]?.message?.content ?? "");
    if (!draft) return { error: "empty draft" };

    await ctx.runMutation(internal.replyDrafter.save, {
      matchId: args.matchId,
      draft,
      model,
    });
    return { draft };
  },
});

// CLI helper: pick a scored match to eyeball a draft without the UI.
//   npx convex run replyDrafter:sample '{"intent":"high"}' --prod
export const sample = internalQuery({
  args: { intent: v.string() },
  handler: async (ctx, args) => {
    for await (const match of ctx.db.query("matches")) {
      if (match.intentScore !== args.intent) continue;
      const post = await ctx.db.get(match.postId);
      if (!post) continue;
      return {
        matchId: match._id,
        platform: post.platform,
        title: post.title,
        reason: match.intentReason,
      };
    }
    return null;
  },
});

// Drafting happens per request only. An automatic pass over every scored
// match cost about six cents each on the writing model, which does not
// survive contact with real volume.

// What the dashboard calls. Owning the match is the whole permission check.
export const draft = action({
  args: { matchId: v.id("matches"), force: v.optional(v.boolean()) },
  handler: async (ctx, args): Promise<{ draft: string } | { error: string }> => {
    // Actions have no db, so the ownership check reads the identity directly.
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { error: "not signed in" };
    const info = await ctx.runQuery(internal.replyDrafter.context, {
      matchId: args.matchId,
    });
    if (!info || info.ownerClerkId !== identity.subject) {
      return { error: "no such match" };
    }
    return ctx.runAction(internal.replyDrafter.generate, args);
  },
});
