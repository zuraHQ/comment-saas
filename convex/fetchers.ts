import { v } from "convex/values";
import { action, internalAction, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

type Normalized = {
  externalId: string;
  url: string;
  title: string;
  snippet?: string;
  author?: string;
  subsource?: string;
  postedAt: number;
  score?: number;
  commentCount?: number;
};

function clip(text: string | null | undefined, max = 500): string | undefined {
  if (!text) return undefined;
  const stripped = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return stripped ? stripped.slice(0, max) : undefined;
}

// HN via Algolia: free, no auth. https://hn.algolia.com/api
async function searchHn(keyword: string): Promise<Normalized[]> {
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(keyword)}&tags=story&hitsPerPage=30`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HN search failed: ${res.status}`);
  const data = await res.json();
  return (data.hits ?? [])
    .filter((h: any) => h.title)
    .map((h: any) => ({
      externalId: String(h.objectID),
      url: `https://news.ycombinator.com/item?id=${h.objectID}`,
      title: h.title,
      snippet: clip(h.story_text),
      author: h.author ?? undefined,
      postedAt: (h.created_at_i ?? 0) * 1000,
      score: h.points ?? undefined,
      commentCount: h.num_comments ?? undefined,
    }));
}

const REDDIT_UA = "web:comment-saas:0.1 (reply-marketing research)";

// App-only OAuth token (client_credentials). Public .json is blocked from
// cloud IPs, so credentials are effectively required in production.
async function redditToken(): Promise<string> {
  const id = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error("REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET not set on this deployment");
  }
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": REDDIT_UA,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`Reddit token failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

async function searchReddit(keyword: string): Promise<Normalized[]> {
  const token = await redditToken();
  const url = `https://oauth.reddit.com/search?q=${encodeURIComponent(keyword)}&sort=new&t=week&limit=30&raw_json=1`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, "User-Agent": REDDIT_UA },
  });
  if (!res.ok) throw new Error(`Reddit search failed: ${res.status}`);
  const data = await res.json();
  return (data?.data?.children ?? [])
    .map((c: any) => c.data)
    .filter((d: any) => d?.id && d?.title)
    .map((d: any) => ({
      externalId: String(d.id),
      url: `https://www.reddit.com${d.permalink}`,
      title: d.title,
      snippet: clip(d.selftext),
      author: d.author ?? undefined,
      subsource: d.subreddit_name_prefixed ?? undefined,
      postedAt: (d.created_utc ?? 0) * 1000,
      score: d.score ?? undefined,
      commentCount: d.num_comments ?? undefined,
    }));
}

const SEARCHERS: Record<string, (keyword: string) => Promise<Normalized[]>> = {
  hn: searchHn,
  reddit: searchReddit,
};

type JobResult = {
  platform: string;
  keyword: string;
  fetched?: number;
  inserted?: number;
  matched?: number;
  error?: string;
};

async function runJob(ctx: ActionCtx, job: Doc<"searchJobs">): Promise<JobResult> {
  const search = SEARCHERS[job.platform];
  if (!search) return { platform: job.platform, keyword: job.keyword, error: "no searcher" };
  try {
    const posts = await search(job.keyword);
    const result = await ctx.runMutation(internal.pipeline.ingest, {
      platform: job.platform,
      keyword: job.keyword,
      posts,
    });
    await ctx.runMutation(internal.pipeline.markJobRan, { jobId: job._id });
    return { platform: job.platform, keyword: job.keyword, fetched: posts.length, ...result };
  } catch (err) {
    return { platform: job.platform, keyword: job.keyword, error: String(err) };
  }
}

// Cron entry point: walk due jobs across all platforms.
export const runDueJobs = internalAction({
  args: {},
  handler: async (ctx): Promise<JobResult[]> => {
    const jobs: Doc<"searchJobs">[] = await ctx.runQuery(internal.pipeline.dueJobs, {
      olderThanMs: 10 * 60 * 1000,
      limit: 20,
    });
    const results: JobResult[] = [];
    for (const job of jobs) {
      results.push(await runJob(ctx, job));
    }
    return results;
  },
});

// Dashboard refresh button: immediate fetch for one project's keywords,
// 3-minute cooldown per job so users can't burn our rate limits.
export const refreshProject = action({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args): Promise<JobResult[] | { error: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { error: "not signed in" };

    const project: Doc<"projects"> | null = await ctx.runQuery(
      internal.pipeline.ownedProjectForRefresh,
      { projectId: args.projectId, clerkId: identity.subject },
    );
    if (!project) return { error: "unknown project" };

    const jobs: Doc<"searchJobs">[] = await ctx.runQuery(internal.pipeline.jobsForKeywords, {
      keywords: project.keywords,
      olderThanMs: 3 * 60 * 1000,
    });
    const results: JobResult[] = [];
    for (const job of jobs) {
      results.push(await runJob(ctx, job));
    }
    return results;
  },
});
