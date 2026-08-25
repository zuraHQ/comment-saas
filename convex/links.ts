import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
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
