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
  type?: string;
  parentUrl?: string;
  parentTitle?: string;
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

// Bluesky: app.bsky.feed.searchPosts needs a session, so we sign in with an
// app password (Settings -> App Passwords) and reuse the token until it ages
// out. There is no paid API key involved.
let blueskySession: { token: string; expires: number } | null = null;

async function blueskyToken(): Promise<string> {
  if (blueskySession && blueskySession.expires > Date.now()) {
    return blueskySession.token;
  }
  const identifier = process.env.BLUESKY_IDENTIFIER;
  const password = process.env.BLUESKY_APP_PASSWORD;
  if (!identifier || !password) {
    throw new Error(
      "BLUESKY_IDENTIFIER / BLUESKY_APP_PASSWORD not set on this deployment",
    );
  }
  const res = await fetch(
    "https://bsky.social/xrpc/com.atproto.server.createSession",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    },
  );
  if (!res.ok) throw new Error(`Bluesky login failed: ${res.status}`);
  const data = await res.json();
  // Access tokens last a couple of hours; refresh well before that.
  blueskySession = { token: data.accessJwt, expires: Date.now() + 30 * 60 * 1000 };
  return data.accessJwt;
}

// Posts have no title, so the first line doubles as one.
function firstLine(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 120 ? `${clean.slice(0, 117)}...` : clean;
}

async function searchBluesky(keyword: string): Promise<Normalized[]> {
  const token = await blueskyToken();
  const url = `https://bsky.social/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(keyword)}&limit=100&sort=latest`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Bluesky search failed: ${res.status}`);
  const data = await res.json();

  return (data.posts ?? [])
    .filter((p: any) => p?.uri && p?.record?.text)
    .map((p: any) => {
      const rkey = String(p.uri).split("/").pop();
      const handle = p.author?.handle;
      return {
        externalId: String(p.uri),
        url: `https://bsky.app/profile/${handle}/post/${rkey}`,
        title: firstLine(p.record.text),
        snippet: clip(p.record.text),
        author: handle ? `@${handle}` : undefined,
        postedAt: Date.parse(p.record.createdAt ?? p.indexedAt ?? "") || Date.now(),
        score: p.likeCount ?? undefined,
        commentCount: p.replyCount ?? undefined,
      };
    });
}

// GitHub Discussions via GraphQL search. Needs a free classic PAT with
// public repo read; no app review.
async function searchGithubDiscussions(keyword: string): Promise<Normalized[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not set on this deployment");

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "comment-saas/0.1",
    },
    body: JSON.stringify({
      query: `query($q: String!) {
        search(query: $q, type: DISCUSSION, first: 50) {
          nodes {
            ... on Discussion {
              id
              title
              bodyText
              url
              createdAt
              upvoteCount
              author { login }
              repository { nameWithOwner }
              comments { totalCount }
            }
          }
        }
      }`,
      variables: { q: `${keyword} sort:created-desc` },
    }),
  });
  if (!res.ok) throw new Error(`GitHub search failed: ${res.status}`);
  const data = await res.json();
  if (data.errors?.length) {
    throw new Error(`GitHub GraphQL: ${data.errors[0].message}`);
  }

  return (data.data?.search?.nodes ?? [])
    .filter((n: any) => n?.id && n?.title)
    .map((n: any) => ({
      externalId: String(n.id),
      url: n.url,
      title: n.title,
      snippet: clip(n.bodyText),
      author: n.author?.login ?? undefined,
      subsource: n.repository?.nameWithOwner ?? undefined,
      postedAt: Date.parse(n.createdAt) || Date.now(),
      score: n.upvoteCount ?? undefined,
      commentCount: n.comments?.totalCount ?? undefined,
    }));
}

// YouTube Data API v3. Free key, but a search costs 100 of the 10k/day
// quota, so these jobs run on a slow interval (see PLATFORM_MIN_INTERVAL_MS).
async function searchYoutube(keyword: string): Promise<Normalized[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY not set on this deployment");

  const params = new URLSearchParams({
    part: "snippet",
    q: keyword,
    type: "video",
    order: "date",
    maxResults: "50",
    relevanceLanguage: "en",
    key,
  });
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`,
  );
  if (!res.ok) throw new Error(`YouTube search failed: ${res.status}`);
  const data = await res.json();

  return (data.items ?? [])
    .filter((item: any) => item?.id?.videoId && item?.snippet?.title)
    .map((item: any) => ({
      externalId: String(item.id.videoId),
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      title: item.snippet.title,
      snippet: clip(item.snippet.description),
      author: item.snippet.channelTitle ?? undefined,
      subsource: item.snippet.channelTitle ?? undefined,
      postedAt: Date.parse(item.snippet.publishedAt) || Date.now(),
    }));
}

// ---- Apify-backed platforms: Facebook and Instagram comment sections ----
// The page's own posts are only plumbing to find post URLs; ONLY comments
// enter the pool as leads.

async function apifyRun(actorId: string, input: unknown): Promise<any[]> {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("APIFY_TOKEN not set on this deployment");
  const res = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${token}&timeout=240`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) {
    throw new Error(`Apify ${actorId} failed: ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// Drop obvious junk before it costs scoring tokens: too short, no real words.
// Apify actors are loose with types; likes arrive as "10" on Facebook.
function asNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function isWorthScoring(text: string): boolean {
  const clean = text.trim();
  return clean.length >= 15 && /[a-zA-Z]{3}/.test(clean);
}

const APIFY_POSTS_PER_PAGE = 5;
const APIFY_COMMENTS_PER_RUN = 50;

async function fetchFacebookComments(page: string): Promise<Normalized[]> {
  const pageUrl = page.startsWith("http")
    ? page
    : `https://www.facebook.com/${page}`;
  const posts = await apifyRun("apify~facebook-posts-scraper", {
    startUrls: [{ url: pageUrl }],
    resultsLimit: APIFY_POSTS_PER_PAGE,
  });
  const postUrls = posts.map((p: any) => p?.url).filter(Boolean);
  if (!postUrls.length) return [];

  const comments = await apifyRun("apify~facebook-comments-scraper", {
    startUrls: postUrls.map((url: string) => ({ url })),
    resultsLimit: APIFY_COMMENTS_PER_RUN,
  });

  return comments
    .filter((c: any) => c?.id && c?.text && isWorthScoring(c.text))
    .map((c: any) => ({
      externalId: String(c.id),
      url: c.commentUrl ?? c.facebookUrl ?? pageUrl,
      title: firstLine(c.text),
      snippet: clip(c.text),
      author: c.profileName ?? undefined,
      subsource: page.replace(/^https?:\/\/(www\.)?facebook\.com\//, ""),
      postedAt: Date.parse(c.date ?? "") || Date.now(),
      score: asNumber(c.likesCount),
      commentCount: asNumber(c.commentsCount),
      type: "comment",
      parentUrl: c.inputUrl ?? undefined,
      parentTitle: c.postTitle ? clip(c.postTitle, 200) : undefined,
    }));
}

async function fetchInstagramComments(account: string): Promise<Normalized[]> {
  const handle = account
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    .replace(/^@/, "")
    .replace(/\/$/, "");
  const posts = await apifyRun("apify~instagram-scraper", {
    directUrls: [`https://www.instagram.com/${handle}/`],
    resultsType: "posts",
    resultsLimit: APIFY_POSTS_PER_PAGE,
  });
  const bycaption: Record<string, string> = {};
  const postUrls: string[] = [];
  for (const post of posts) {
    if (!post?.url) continue;
    postUrls.push(post.url);
    if (post.caption) bycaption[post.url] = post.caption;
  }
  if (!postUrls.length) return [];

  const comments = await apifyRun("apify~instagram-comment-scraper", {
    directUrls: postUrls,
    resultsLimit: APIFY_COMMENTS_PER_RUN,
  });

  return comments
    .filter((c: any) => c?.id && c?.text && isWorthScoring(c.text))
    .map((c: any) => ({
      externalId: String(c.id),
      url: c.commentUrl || c.postUrl || `https://www.instagram.com/${handle}/`,
      title: firstLine(c.text),
      snippet: clip(c.text),
      author: c.ownerUsername ? `@${c.ownerUsername}` : undefined,
      subsource: `@${handle}`,
      postedAt: Date.parse(c.timestamp ?? "") || Date.now(),
      score: asNumber(c.likesCount),
      commentCount: asNumber(c.repliesCount),
      type: "comment",
      parentUrl: c.postUrl ?? undefined,
      parentTitle: c.postUrl && bycaption[c.postUrl] ? clip(bycaption[c.postUrl], 200) : undefined,
    }));
}

type Fetcher = (query: string) => Promise<Normalized[]>;

const FETCHERS: Record<string, Fetcher | undefined> = {
  "reddit:community": fetchSubreddit,
  "reddit:keyword": searchReddit,
  "hn:keyword": searchHn,
  "hn:community": fetchHnFeed,
  "bluesky:keyword": searchBluesky,
  "github:keyword": searchGithubDiscussions,
  "youtube:keyword": searchYoutube,
  "facebook:community": fetchFacebookComments,
  "instagram:community": fetchInstagramComments,
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
    return { ...label, fetched: posts.length, ...result };
  } catch (err) {
    return { ...label, error: String(err) };
  } finally {
    // Stamp failures too: a job missing credentials must wait its interval
    // out instead of hogging every batch and starving other platforms.
    await ctx.runMutation(internal.pipeline.markJobRan, { jobId: job._id });
  }
}

// Cron entry point: walk due jobs across all platforms.
export const runDueJobs = internalAction({
  args: {},
  handler: async (ctx): Promise<JobResult[]> => {
    const jobs: Doc<"jobs">[] = await ctx.runQuery(internal.pipeline.dueJobs, {
      olderThanMs: 10 * 60 * 1000,
      limit: 50,
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
      facebookPages: project.facebookPages,
      instagramAccounts: project.instagramAccounts,
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
