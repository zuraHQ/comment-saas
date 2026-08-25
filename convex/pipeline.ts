import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { requireOwnedProject } from "./auth";

export const normalizedPost = v.object({
  externalId: v.string(),
  url: v.string(),
  title: v.string(),
  snippet: v.optional(v.string()),
  author: v.optional(v.string()),
  subsource: v.optional(v.string()),
  postedAt: v.number(),
  score: v.optional(v.number()),
  commentCount: v.optional(v.number()),
});

// Dedupe against the pool, then fan out matches to every project whose
// keywords include the keyword that found the post. Each match carries its
// owner so a user's feed can never be read through someone else's project.
export const ingest = internalMutation({
  args: {
    platform: v.string(),
    keyword: v.string(),
    posts: v.array(normalizedPost),
  },
  handler: async (ctx, args) => {
    const projects = await ctx.db.query("projects").collect();
    const interested = projects.filter((p) => p.keywords.includes(args.keyword));
    let inserted = 0;
    let matched = 0;

    for (const post of args.posts) {
      const existing = await ctx.db
        .query("posts")
        .withIndex("by_platform_external", (q) =>
          q.eq("platform", args.platform).eq("externalId", post.externalId),
        )
        .unique();

      let postId = existing?._id;
      if (!postId) {
        postId = await ctx.db.insert("posts", {
          ...post,
          platform: args.platform,
          fetchedByKeyword: args.keyword,
        });
        inserted++;
      }

      for (const project of interested) {
        const match = await ctx.db
          .query("matches")
          .withIndex("by_project_post", (q) =>
            q.eq("projectId", project._id).eq("postId", postId),
          )
          .unique();
        if (!match) {
          await ctx.db.insert("matches", {
            projectId: project._id,
            ownerClerkId: project.ownerClerkId,
            postId,
            keyword: args.keyword,
            replied: false,
            postedAt: post.postedAt,
          });
          matched++;
        }
      }
    }
    return { inserted, matched };
  },
});

export const dueJobs = internalQuery({
  args: { olderThanMs: v.number(), limit: v.number() },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.olderThanMs;
    const jobs = await ctx.db.query("searchJobs").collect();
    return jobs
      .filter((j) => (j.lastRunAt ?? 0) < cutoff)
      .sort((a, b) => (a.lastRunAt ?? 0) - (b.lastRunAt ?? 0))
      .slice(0, args.limit);
  },
});

export const jobsForKeywords = internalQuery({
  args: { keywords: v.array(v.string()), olderThanMs: v.number() },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.olderThanMs;
    const due = [];
    for (const keyword of args.keywords) {
      for (const platform of ["hn", "reddit"]) {
        const job = await ctx.db
          .query("searchJobs")
          .withIndex("by_platform_keyword", (q) =>
            q.eq("platform", platform).eq("keyword", keyword),
          )
          .unique();
        if (job && (job.lastRunAt ?? 0) < cutoff) due.push(job);
      }
    }
    return due;
  },
});

export const markJobRan = internalMutation({
  args: { jobId: v.id("searchJobs") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, { lastRunAt: Date.now() });
  },
});

// The dashboard feed for one of the caller's projects.
export const feed = query({
  args: { projectId: v.id("projects"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_project_posted", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(args.limit ?? 100);

    const rows = [];
    for (const match of matches) {
      const post = await ctx.db.get(match.postId);
      if (post) rows.push({ match, post });
    }
    return rows;
  },
});

export const setReplied = mutation({
  args: { matchId: v.id("matches"), replied: v.boolean() },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found");
    await requireOwnedProject(ctx, match.projectId);
    await ctx.db.patch(args.matchId, { replied: args.replied });
  },
});

// Used by the refresh action to check ownership before spending rate limit.
export const ownedProjectForRefresh = internalQuery({
  args: { projectId: v.id("projects"), clerkId: v.string() },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerClerkId !== args.clerkId) return null;
    return project;
  },
});
