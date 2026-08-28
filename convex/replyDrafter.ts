import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { PROJECT_LINK_LABEL } from "./links";
import { SUBREDDIT_CATALOG } from "../lib/subreddit-catalog";

// How people actually talk in each place. Same post, same product, different
// reply: what reads as helpful on Reddit reads as fluff on Hacker News.
const PLATFORM_VOICE: Record<string, string> = {
  hn: `Hacker News. Readers are engineers and founders who have seen every pitch. Be concrete and a little understated. Lead with a specific technical or practical detail, a number, a tradeoff you hit. No enthusiasm words, no emoji, no "great question". Two short paragraphs at most. Anything that smells like marketing gets flagged and downvoted.`,
  reddit: `Reddit. Conversational and human. Open with something relatable from your own experience, the actual annoying part of the problem, then get to what helped. Contractions are fine. It should read like a person who has been in this exact spot, not a company account. Three or four sentences up to a short paragraph.`,
  indiehackers: `Indie Hackers. Founder to founder. Specifics are welcome, including numbers and what did not work. Warm, plain, no posturing. Short.`,
  bluesky: `Bluesky. Short and casual, one or two sentences. Low key, no hard sell, no hashtags.`,
  github: `GitHub. Precise and technical. Answer the question directly, mention the tool only if it is genuinely the answer. No fluff, no pleasantries.`,
  youtube: `YouTube comment. Short, friendly, plain words. One or two sentences.`,
  x: `X. Very short, one or two lines, punchy. No thread, no hashtags, no hype.`,
  linkedin: `LinkedIn. Warm and human, but avoid every LinkedIn cliche: no "thrilled", no "game changer", no broetry line breaks. Two or three sentences.`,
};

const RULES = `How to write it:
- Help first. The reply has to be worth reading even if the product is never mentioned.
- Mention the product once, by name, dropped naturally into the sentence where it belongs. Never "I built this, check it out". Never ask them to try it.
- Put the link in exactly once, in that same sentence, written as a bare url in brackets after the name. Use the link given to you verbatim, never the product name as a domain, never a shortened or made up url. If the platform is x, leave the link out entirely, links there kill reach.
- If the product does not honestly answer what they asked, say something useful and do not mention it at all.
- Say something relatable or a real opinion. A reply that only restates their problem is worthless.
- No em dashes anywhere. Use commas or full stops.
- Not corporate. Welcoming, plain spoken, the way a person types.
- No greeting and no sign off. No "Great question", no "Hope this helps".
- Never claim a capability that is not in the product description.
- Do not use headings, bullet points or bold. Plain sentences.

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

${voice}

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
