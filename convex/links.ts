import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireOwnedProject } from "./auth";

const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/O/1/l/i

function randomCode() {
  let code = "";
  for (let i = 0; i < 7; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

// Create a tracked link for a reply. Returns the short code for /r/[code].
export const createLink = mutation({
  args: {
    projectId: v.id("projects"),
    targetUrl: v.string(),
    platform: v.string(),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await requireOwnedProject(ctx, args.projectId);
    let code = randomCode();
    while (
      await ctx.db
        .query("trackedLinks")
        .withIndex("by_code", (q) => q.eq("code", code))
        .unique()
    ) {
      code = randomCode();
    }
    await ctx.db.insert("trackedLinks", {
      code,
      ownerClerkId: project.ownerClerkId,
      ...args,
    });
    return { code, path: `/r/${code}` };
  },
});

// Log a click and return the destination. Called by the public /r/[code]
// route, so this one is intentionally unauthenticated.
export const logClickAndGetTarget = mutation({
  args: {
    code: v.string(),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, { code, referrer, userAgent }) => {
    const link = await ctx.db
      .query("trackedLinks")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (!link) return null;

    await ctx.db.insert("linkClicks", { linkId: link._id, referrer, userAgent });
    return link.targetUrl;
  },
});

// Per-link click totals for one of the caller's projects.
export const statsForProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    await requireOwnedProject(ctx, projectId);
    const links = await ctx.db
      .query("trackedLinks")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    return await Promise.all(
      links.map(async (link) => {
        const clicks = await ctx.db
          .query("linkClicks")
          .withIndex("by_link", (q) => q.eq("linkId", link._id))
          .collect();
        return {
          code: link.code,
          platform: link.platform,
          label: link.label,
          targetUrl: link.targetUrl,
          clicks: clicks.length,
        };
      }),
    );
  },
});

export const PROJECT_LINK_LABEL = "__project__";

// One permanent tracked link per project. Attribution comes from the click's
// referrer, so a single link still tells us which platform sent the visitor.
export const getProjectLink = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await requireOwnedProject(ctx, args.projectId);
    if (!project.url) return { error: "no-url" as const };

    const links = await ctx.db
      .query("trackedLinks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const existing = links.find((l) => l.label === PROJECT_LINK_LABEL);
    if (existing) {
      if (existing.targetUrl !== project.url) {
        await ctx.db.patch(existing._id, { targetUrl: project.url });
      }
      return { code: existing.code, path: `/r/${existing.code}` };
    }

    let code = randomCode();
    while (
      await ctx.db
        .query("trackedLinks")
        .withIndex("by_code", (q) => q.eq("code", code))
        .unique()
    ) {
      code = randomCode();
    }
    await ctx.db.insert("trackedLinks", {
      code,
      projectId: args.projectId,
      ownerClerkId: project.ownerClerkId,
      targetUrl: project.url,
      platform: "any",
      label: PROJECT_LINK_LABEL,
    });
    return { code, path: `/r/${code}` };
  },
});

// Which platform a click's referrer belongs to.
function platformFromReferrer(referrer: string | undefined): string {
  if (!referrer) return "direct";
  let host = "";
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "direct";
  }
  if (host.endsWith("reddit.com")) return "reddit";
  if (host.endsWith("ycombinator.com")) return "hn";
  if (host.endsWith("bsky.app")) return "bluesky";
  if (host.endsWith("threads.com") || host.endsWith("threads.net")) return "threads";
  if (host.endsWith("facebook.com") || host === "l.facebook.com" || host === "lm.facebook.com") return "facebook";
  if (host.endsWith("instagram.com") || host === "l.instagram.com") return "instagram";
  if (host.endsWith("tiktok.com")) return "tiktok";
  if (host.endsWith("github.com")) return "github";
  if (host.endsWith("youtube.com") || host === "youtu.be") return "youtube";
  if (host.endsWith("x.com") || host.endsWith("twitter.com") || host === "t.co") return "x";
  return "other";
}

// Click totals broken down by where the visitor came from.
export const clickBreakdown = query({
  args: {
    projectId: v.id("projects"),
    // Only count clicks from the last N days; omit for all time.
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    const links = await ctx.db
      .query("trackedLinks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const since = args.days ? Date.now() - args.days * 24 * 60 * 60 * 1000 : 0;
    let total = 0;
    const byPlatform: Record<string, number> = {};
    // Clicks per day for the chart, oldest first.
    const byDay = new Map<string, number>();
    let lastClickAt: number | null = null;

    for (const link of links) {
      const clicks = await ctx.db
        .query("linkClicks")
        .withIndex("by_link", (q) => q.eq("linkId", link._id))
        .collect();
      for (const click of clicks) {
        if (click._creationTime < since) continue;
        total++;
        const source = platformFromReferrer(click.referrer);
        byPlatform[source] = (byPlatform[source] ?? 0) + 1;
        const day = new Date(click._creationTime).toISOString().slice(0, 10);
        byDay.set(day, (byDay.get(day) ?? 0) + 1);
        if (!lastClickAt || click._creationTime > lastClickAt) {
          lastClickAt = click._creationTime;
        }
      }
    }

    // Fill empty days so the chart has a continuous axis.
    const span = args.days ?? 30;
    const series: Array<{ day: string; clicks: number }> = [];
    for (let i = span - 1; i >= 0; i--) {
      const day = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      series.push({ day, clicks: byDay.get(day) ?? 0 });
    }

    return { total, byPlatform, series, lastClickAt };
  },
});

// CLI helper: wipe all tracked links and clicks for a fresh start.
//   npx convex run links:resetAnalytics '{}' --prod
export const resetAnalytics = internalMutation({
  args: {},
  handler: async (ctx) => {
    let clicks = 0;
    let links = 0;
    for (const click of await ctx.db.query("linkClicks").collect()) {
      await ctx.db.delete(click._id);
      clicks++;
    }
    for (const link of await ctx.db.query("trackedLinks").collect()) {
      await ctx.db.delete(link._id);
      links++;
    }
    return { links, clicks };
  },
});
