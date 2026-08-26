import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireOwnedProject } from "./auth";
import { COMMUNITY_PLATFORMS, HN_FEEDS, KEYWORD_PLATFORMS } from "./platforms";

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
    kind: v.string(), // "community" | "keyword"
    query: v.string(),
    posts: v.array(normalizedPost),
  },
  handler: async (ctx, args) => {
    const projects = await ctx.db.query("projects").collect();
    // A community job feeds every project watching that community; a keyword
    // job feeds every project tracking that phrase.
    const interested = projects.filter((p) => {
      if (args.kind === "keyword") return p.keywords.includes(args.query);
      // HN feeds are not user-picked: everyone watching HN gets them.
      if (args.platform === "hn") return p.platforms.includes("hn");
      return p.communities.includes(args.query);
    });
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
          fetchedVia: `${args.kind}:${args.query}`,
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
            source: args.kind,
            query: args.query,
            replied: false,
            postedAt: post.postedAt,
          });
          matched++;
        }
      }
    }
    if (matched > 0) {
      // Score new matches immediately; badges show "Scoring" until then.
      await ctx.scheduler.runAfter(0, internal.intentMarker.scoreDue, {});
    }
    return { inserted, matched };
  },
});

export const dueJobs = internalQuery({
  args: { olderThanMs: v.number(), limit: v.number() },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.olderThanMs;
    const jobs = await ctx.db.query("jobs").collect();
    return jobs
      .filter((j) => (j.lastRunAt ?? 0) < cutoff)
      .sort((a, b) => (a.lastRunAt ?? 0) - (b.lastRunAt ?? 0))
      .slice(0, args.limit);
  },
});

// Everything one project needs fetched, both intake paths.
export const jobsForProject = internalQuery({
  args: {
    keywords: v.array(v.string()),
    communities: v.array(v.string()),
    platforms: v.array(v.string()),
    olderThanMs: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.olderThanMs;
    const wanted: Array<{ platform: string; kind: string; query: string }> = [];

    for (const platform of KEYWORD_PLATFORMS) {
      if (!args.platforms.includes(platform)) continue;
      for (const keyword of args.keywords) {
        wanted.push({ platform, kind: "keyword", query: keyword });
      }
    }
    for (const platform of COMMUNITY_PLATFORMS) {
      if (!args.platforms.includes(platform)) continue;
      for (const community of args.communities) {
        wanted.push({ platform, kind: "community", query: community });
      }
    }
    if (args.platforms.includes("hn")) {
      for (const feed of HN_FEEDS) {
        wanted.push({ platform: "hn", kind: "community", query: feed });
      }
    }

    const due = [];
    for (const want of wanted) {
      const job = await ctx.db
        .query("jobs")
        .withIndex("by_platform_kind_query", (q) =>
          q
            .eq("platform", want.platform)
            .eq("kind", want.kind)
            .eq("query", want.query),
        )
        .unique();
      if (job && (job.lastRunAt ?? 0) < cutoff) due.push(job);
    }
    return due;
  },
});

export const markJobRan = internalMutation({
  args: { jobId: v.id("jobs") },
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

// Ops helper: recreate the deduped job list from every project's keywords and
// communities. Safe to re-run; existing jobs keep their lastRunAt.
//   npx convex run pipeline:rebuildJobs '{}' --prod
export const rebuildJobs = internalMutation({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    let created = 0;

    const ensure = async (platform: string, kind: string, query: string) => {
      const existing = await ctx.db
        .query("jobs")
        .withIndex("by_platform_kind_query", (q) =>
          q.eq("platform", platform).eq("kind", kind).eq("query", query),
        )
        .unique();
      if (!existing) {
        await ctx.db.insert("jobs", { platform, kind, query });
        created++;
      }
    };

    for (const project of projects) {
      for (const platform of KEYWORD_PLATFORMS) {
        if (!project.platforms.includes(platform)) continue;
        for (const keyword of project.keywords) {
          await ensure(platform, "keyword", keyword);
        }
      }
      for (const platform of COMMUNITY_PLATFORMS) {
        if (!project.platforms.includes(platform)) continue;
        for (const community of project.communities) {
          await ensure(platform, "community", community);
        }
      }
      if (project.platforms.includes("hn")) {
        for (const feed of HN_FEEDS) {
          await ensure("hn", "community", feed);
        }
      }
    }
    return { projects: projects.length, created };
  },
});

// Ops helper: drop jobs no project wants any more, so removing a keyword or a
// community actually stops the fetching.
//   npx convex run pipeline:pruneJobs '{}' --prod
export const pruneJobs = internalMutation({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    const wanted = new Set<string>();

    for (const project of projects) {
      for (const platform of KEYWORD_PLATFORMS) {
        if (!project.platforms.includes(platform)) continue;
        for (const keyword of project.keywords) {
          wanted.add(`${platform}:keyword:${keyword}`);
        }
      }
      for (const platform of COMMUNITY_PLATFORMS) {
        if (!project.platforms.includes(platform)) continue;
        for (const community of project.communities) {
          wanted.add(`${platform}:community:${community}`);
        }
      }
      if (project.platforms.includes("hn")) {
        for (const feed of HN_FEEDS) {
          wanted.add(`hn:community:${feed}`);
        }
      }
    }

    let deleted = 0;
    for (const job of await ctx.db.query("jobs").collect()) {
      if (wanted.has(`${job.platform}:${job.kind}:${job.query}`)) continue;
      await ctx.db.delete(job._id);
      deleted++;
    }
    return { kept: wanted.size, deleted };
  },
});

// New-project backfill: match the existing pool against a project so day one
// is not an empty feed. Reuses the fetchedVia tag to decide interest.
//   npx convex run pipeline:backfillProject '{"projectId":"..."}' --prod
export const backfillProject = internalMutation({
  args: { projectId: v.id("projects"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return { error: "no such project" };

    let matched = 0;
    let scanned = 0;
    const cap = args.limit ?? 500;

    for await (const post of ctx.db.query("posts").order("desc")) {
      if (++scanned > cap) break;

      const [kind, ...rest] = post.fetchedVia.split(":");
      const query = rest.join(":");
      const interested =
        post.platform === "hn"
          ? project.platforms.includes("hn")
          : kind === "community"
            ? project.platforms.includes(post.platform) &&
              project.communities.includes(query)
            : project.platforms.includes(post.platform) &&
              project.keywords.includes(query);
      if (!interested) continue;

      const existing = await ctx.db
        .query("matches")
        .withIndex("by_project_post", (q) =>
          q.eq("projectId", project._id).eq("postId", post._id),
        )
        .unique();
      if (existing) continue;

      await ctx.db.insert("matches", {
        projectId: project._id,
        ownerClerkId: project.ownerClerkId,
        postId: post._id,
        source: kind,
        query,
        replied: false,
        postedAt: post.postedAt,
      });
      matched++;
    }

    if (matched > 0) {
      await ctx.scheduler.runAfter(0, internal.intentMarker.scoreDue, {});
    }
    return { scanned: scanned - 1, matched };
  },
});

// Per-source performance: how many posts each keyword / community produced,
// and how good they were. Powers the sources table on Analytics.
export const sourceStats = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const bySource = new Map<
      string,
      {
        source: string;
        query: string;
        total: number;
        high: number;
        medium: number;
        low: number;
        replied: number;
      }
    >();
    for (const match of matches) {
      const key = `${match.source}:${match.query}`;
      let row = bySource.get(key);
      if (!row) {
        row = {
          source: match.source,
          query: match.query,
          total: 0,
          high: 0,
          medium: 0,
          low: 0,
          replied: 0,
        };
        bySource.set(key, row);
      }
      row.total++;
      if (match.intentScore === "high") row.high++;
      else if (match.intentScore === "medium") row.medium++;
      else if (match.intentScore === "low") row.low++;
      if (match.replied) row.replied++;
    }

    return [...bySource.values()].sort(
      (a, b) => b.high - a.high || b.total - a.total,
    );
  },
});
