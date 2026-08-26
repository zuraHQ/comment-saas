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
async function hnGet(params: string): Promise<Normalized[]> {
  const res = await fetch(`https://hn.algolia.com/api/v1/search_by_date?${params}`);
  if (!res.ok) throw new Error(`HN request failed: ${res.status}`);
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

function searchHn(keyword: string) {
  return hnGet(`query=${encodeURIComponent(keyword)}&tags=story&hitsPerPage=50`);
}

// HN only produces a few hundred stories a day, so we read the whole thing
// rather than guessing keywords. "ask" and "show" are the high-signal slices.
const HN_FEEDS: Record<string, string> = {
  all: "tags=story&hitsPerPage=100",
  ask: "tags=ask_hn&hitsPerPage=50",
  show: "tags=show_hn&hitsPerPage=50",
};

function fetchHnFeed(feed: string) {
  const params = HN_FEEDS[feed];
  if (!params) throw new Error(`Unknown HN feed: ${feed}`);
  return hnGet(params);
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

function parseRedditListing(data: any): Normalized[] {
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

async function redditGet(path: string): Promise<Normalized[]> {
  const token = await redditToken();
  const res = await fetch(`https://oauth.reddit.com${path}`, {
    headers: { Authorization: `Bearer ${token}`, "User-Agent": REDDIT_UA },
  });
  if (!res.ok) throw new Error(`Reddit request failed: ${res.status}`);
  return parseRedditListing(await res.json());
}

// Keyword sweep across all of Reddit: catches phrasings outside the watched
// communities, noisier by nature.
function searchReddit(keyword: string) {
  return redditGet(
    `/search?q=${encodeURIComponent(keyword)}&sort=new&t=week&limit=100&raw_json=1`,
  );
}

// Read a community end to end. No query, so nothing is filtered out before we
// get to judge it. This is the primary intake path.
function fetchSubreddit(name: string) {
  return redditGet(`/r/${encodeURIComponent(name)}/new?limit=100&raw_json=1`);
}

type Fetcher = (query: string) => Promise<Normalized[]>;

const FETCHERS: Record<string, Fetcher | undefined> = {
  "reddit:community": fetchSubreddit,
  "reddit:keyword": searchReddit,
  "hn:keyword": searchHn,
  "hn:community": fetchHnFeed,
};

type JobResult = {
  platform: string;
  kind: string;
  query: string;
  fetched?: number;
  inserted?: number;
  matched?: number;
  error?: string;
};

async function runJob(ctx: ActionCtx, job: Doc<"jobs">): Promise<JobResult> {
  const label = { platform: job.platform, kind: job.kind, query: job.query };
  const fetcher = FETCHERS[`${job.platform}:${job.kind}`];
  if (!fetcher) return { ...label, error: "no fetcher for this job type" };
  try {
    const posts = await fetcher(job.query);
    const result = await ctx.runMutation(internal.pipeline.ingest, {
      platform: job.platform,
      kind: job.kind,
      query: job.query,
      posts,
    });
    await ctx.runMutation(internal.pipeline.markJobRan, { jobId: job._id });
    return { ...label, fetched: posts.length, ...result };
  } catch (err) {
    return { ...label, error: String(err) };
  }
}

// Cron entry point: walk due jobs across all platforms.
export const runDueJobs = internalAction({
  args: {},
  handler: async (ctx): Promise<JobResult[]> => {
    const jobs: Doc<"jobs">[] = await ctx.runQuery(internal.pipeline.dueJobs, {
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

    const jobs: Doc<"jobs">[] = await ctx.runQuery(internal.pipeline.jobsForProject, {
      keywords: project.keywords,
      communities: project.communities,
      platforms: project.platforms,
      olderThanMs: 3 * 60 * 1000,
    });
    const results: JobResult[] = [];
    for (const job of jobs) {
      results.push(await runJob(ctx, job));
    }
    return results;
  },
});
