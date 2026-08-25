import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { requireClerkId, requireOwnedProject } from "./auth";

const FETCH_PLATFORMS = ["hn", "reddit"] as const;

function normalizeKeywords(keywords: string[]) {
  return [...new Set(keywords.map((k) => k.trim().toLowerCase()).filter(Boolean))];
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
}

// Keyword universe is global and deduped: ten projects tracking "crm" share
// one search job.
async function ensureSearchJobs(ctx: MutationCtx, keywords: string[]) {
  for (const platform of FETCH_PLATFORMS) {
    for (const keyword of keywords) {
      const existing = await ctx.db
        .query("searchJobs")
        .withIndex("by_platform_keyword", (q) =>
          q.eq("platform", platform).eq("keyword", keyword),
        )
        .unique();
      if (!existing) await ctx.db.insert("searchJobs", { platform, keyword });
    }
  }
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerClerkId", identity.subject))
      .collect();
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => requireOwnedProject(ctx, args.projectId),
});

export const create = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
    postTypes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const ownerClerkId = await requireClerkId(ctx);
    const keywords = normalizeKeywords(args.keywords ?? []);

    // Slugs only need to be unique per owner.
    const base = slugify(args.name);
    let slug = base;
    let n = 2;
    while (
      await ctx.db
        .query("projects")
        .withIndex("by_owner_slug", (q) =>
          q.eq("ownerClerkId", ownerClerkId).eq("slug", slug),
        )
        .unique()
    ) {
      slug = `${base}-${n++}`;
    }

    const projectId = await ctx.db.insert("projects", {
      ownerClerkId,
      slug,
      name: args.name.trim() || "New project",
      color: args.color,
      url: args.url,
      description: args.description,
      keywords,
      postTypes: args.postTypes ?? [],
    });
    await ensureSearchJobs(ctx, keywords);
    return projectId;
  },
});

export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
    postTypes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    const { projectId, keywords, ...rest } = args;
    const patch: Record<string, unknown> = { ...rest };
    if (keywords) {
      const normalized = normalizeKeywords(keywords);
      patch.keywords = normalized;
      await ensureSearchJobs(ctx, normalized);
    }
    await ctx.db.patch(projectId, patch);
  },
});

// Deleting a project takes its feed and tracked links with it.
export const remove = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);

    const matches = await ctx.db
      .query("matches")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const match of matches) await ctx.db.delete(match._id);

    const links = await ctx.db
      .query("trackedLinks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const link of links) {
      const clicks = await ctx.db
        .query("linkClicks")
        .withIndex("by_link", (q) => q.eq("linkId", link._id))
        .collect();
      for (const click of clicks) await ctx.db.delete(click._id);
      await ctx.db.delete(link._id);
    }

    await ctx.db.delete(args.projectId);
  },
});
