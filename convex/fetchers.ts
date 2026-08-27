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

// Apify fallback for Reddit (trudax/reddit-scraper-lite): ~$0.04/run floor,
// so it runs on a slow interval. The official API takes over automatically
// the moment REDDIT_CLIENT_ID exists on the deployment.
function parseApifyReddit(items: any[]): Normalized[] {
  return items
    .filter((d: any) => d?.dataType === "post" && d?.id && d?.title && !d?.isAd)
    .map((d: any) => ({
      externalId: String(d.id).replace(/^t3_/, ""),
      url: d.url,
      title: d.title,
      snippet: clip(d.body),
      author: d.username ?? undefined,
      subsource: d.communityName ?? undefined,
      postedAt: Date.parse(d.createdAt ?? "") || Date.now(),
      score: asNumber(d.upVotes),
      commentCount: asNumber(d.numberOfComments),
    }));
}

const APIFY_REDDIT_ITEMS = 1; // testing spend guard; raise for launch

// Keyword sweep across all of Reddit: catches phrasings outside the watched
// communities, noisier by nature.
async function searchReddit(keyword: string): Promise<Normalized[]> {
  if (process.env.REDDIT_CLIENT_ID) {
    return redditGet(
      `/search?q=${encodeURIComponent(keyword)}&sort=new&t=week&limit=100&raw_json=1`,
    );
  }
  const items = await apifyRun("trudax~reddit-scraper-lite", {
    searches: [keyword],
    searchPosts: true,
    // Without these the actor also returns community and user hits, which can
    // eat the whole item budget before a single post is saved.
    searchComments: false,
    searchCommunities: false,
    searchUsers: false,
    skipComments: true,
    sort: "new",
    maxItems: APIFY_REDDIT_ITEMS,
    maxPostCount: APIFY_REDDIT_ITEMS,
  });
  return parseApifyReddit(items);
}

// Read a community end to end. No query, so nothing is filtered out before we
// get to judge it. This is the primary intake path.
async function fetchSubreddit(name: string): Promise<Normalized[]> {
  if (process.env.REDDIT_CLIENT_ID) {
    return redditGet(`/r/${encodeURIComponent(name)}/new?limit=100&raw_json=1`);
  }
  const items = await apifyRun("trudax~reddit-scraper-lite", {
    startUrls: [{ url: `https://www.reddit.com/r/${name}/new/` }],
    skipComments: true,
    maxItems: APIFY_REDDIT_ITEMS,
    maxPostCount: APIFY_REDDIT_ITEMS,
  });
  return parseApifyReddit(items);
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

// ---- Apify-backed platforms: comment sections ----
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
// Apify actors are loose with types; counts sometimes arrive as strings.
function asNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function isWorthScoring(text: string): boolean {
  const clean = text.trim();
  return clean.length >= 15 && /[a-zA-Z]{3}/.test(clean);
}

// Testing spend: 1 post, 1 comment per run. Raise for launch.
const APIFY_POSTS_PER_PAGE = 1;
const APIFY_COMMENTS_PER_RUN = 1;

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

// Threads keyword search (Apify, no first-party actor exists).
async function searchThreads(keyword: string): Promise<Normalized[]> {
  const items = await apifyRun("igview-owner~threads-search-scraper", {
    search: keyword,
    // Testing spend guard; raise for launch.
    maxItems: 1,
  });
  return items
    .filter((t: any) => t?.postId && t?.captionText)
    .map((t: any) => ({
      externalId: String(t.postId),
      url: t.postUrl,
      title: firstLine(t.captionText),
      snippet: clip(t.captionText),
      author: t.username ? `@${t.username}` : undefined,
      postedAt: Date.parse(t.takenAtISO ?? "") || (t.takenAt ? t.takenAt * 1000 : Date.now()),
      score: asNumber(t.likeCount),
      commentCount: asNumber(t.directReplyCount),
    }));
}

// TikTok: comments under a watched account's latest videos. Same
// posts-are-plumbing model as Instagram; only comments are leads.
async function fetchTiktokComments(account: string): Promise<Normalized[]> {
  const handle = account
    .replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/, "")
    .replace(/^@/, "")
    .replace(/\/$/, "");
  const videos = await apifyRun("clockworks~tiktok-scraper", {
    profiles: [handle],
    resultsPerPage: APIFY_POSTS_PER_PAGE,
    excludePinnedPosts: true,
  });
  const videoUrls = videos.map((v: any) => v?.webVideoUrl).filter(Boolean);
  if (!videoUrls.length) return [];
  const captions: Record<string, string> = {};
  for (const v of videos) {
    if (v?.webVideoUrl && v?.text) captions[v.webVideoUrl] = v.text;
  }

  const comments = await apifyRun("clockworks~tiktok-comments-scraper", {
    postURLs: videoUrls,
    commentsPerPost: APIFY_COMMENTS_PER_RUN,
  });

  return comments
    .filter((c: any) => c?.cid && c?.text && isWorthScoring(c.text))
    .map((c: any) => ({
      externalId: String(c.cid),
      url: c.videoWebUrl ?? videoUrls[0],
      title: firstLine(c.text),
      snippet: clip(c.text),
      author: c.uniqueId ? `@${c.uniqueId}` : undefined,
      subsource: `@${handle}`,
      postedAt: Date.parse(c.createTimeISO ?? "") || Date.now(),
      score: asNumber(c.diggCount),
      commentCount: asNumber(c.replyCommentTotal),
      type: "comment",
      parentUrl: c.videoWebUrl ?? undefined,
      parentTitle: c.videoWebUrl && captions[c.videoWebUrl] ? clip(captions[c.videoWebUrl], 200) : undefined,
    }));
}

// X via Apify (apidojo/tweet-scraper): verified per-result pricing at
// ~$0.0004/tweet, no flat run fee. Official API swap-in point later.
const X_MIN_FOLLOWERS = 100;

async function searchX(keyword: string): Promise<Normalized[]> {
  const items = await apifyRun("apidojo~tweet-scraper", {
    // -filter:replies keeps top-level asks; bare @-replies are mostly noise.
    searchTerms: [`${keyword} -filter:replies`],
    // Testing spend guard; raise for launch.
    maxItems: 10,
    sort: "Latest",
    tweetLanguage: "en",
  });
  return items
    .filter((t: any) => t?.id && (t.fullText || t.text) && !t.isRetweet)
    // Burner filter: fresh throwaway accounts have near-zero followers.
    .filter((t: any) => {
      const followers = t.author?.followers;
      if (typeof followers !== "number") return true; // don't drop on missing data
      return followers >= X_MIN_FOLLOWERS || t.author?.isBlueVerified === true;
    })
    .map((t: any) => {
      const text = t.fullText ?? t.text;
      const handle = t.author?.userName;
      return {
        externalId: String(t.id),
        url: t.url ?? `https://x.com/i/status/${t.id}`,
        title: firstLine(text),
        snippet: clip(text),
        author: handle ? `@${handle}` : undefined,
        postedAt: Date.parse(t.createdAt ?? "") || Date.now(),
        score: asNumber(t.likeCount),
        commentCount: asNumber(t.replyCount),
      };
    });
}

// Watch an X account: their own posts. A founder posting "we're building X"
// is itself the lead — the user comments on the post, in front of its
// audience. We deliberately do not mine individual repliers.
async function fetchXAccountPosts(account: string): Promise<Normalized[]> {
  const handle = account
    .replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//, "")
    .replace(/^@/, "")
    .replace(/\/$/, "");
  const items = await apifyRun("apidojo~tweet-scraper", {
    searchTerms: [`from:${handle} -filter:replies`],
    // Testing spend guard; raise for launch.
    maxItems: 10,
    sort: "Latest",
  });
  return items
    .filter((t: any) => t?.id && (t.fullText || t.text) && !t.isRetweet)
    .map((t: any) => {
      const text = t.fullText ?? t.text;
      const author = t.author?.userName;
      return {
        externalId: String(t.id),
        url: t.url ?? `https://x.com/i/status/${t.id}`,
        title: firstLine(text),
        snippet: clip(text),
        author: author ? `@${author}` : undefined,
        subsource: `@${handle}`,
        postedAt: Date.parse(t.createdAt ?? "") || Date.now(),
        score: asNumber(t.likeCount),
        commentCount: asNumber(t.replyCount),
      };
    });
}

// LinkedIn via Apify (harvestapi, no cookies). The actor returns ~100 posts
// per query (~$0.20) regardless of caps, hence the daily interval.
async function searchLinkedin(keyword: string): Promise<Normalized[]> {
  const items = await apifyRun("harvestapi~linkedin-post-search", {
    searchQueries: [keyword],
    maxItems: 100,
    sortBy: "date",
  });
  return items
    .filter((t: any) => t?.id && t?.content && isWorthScoring(t.content))
    .map((t: any) => {
      const author =
        t.author?.name ?? t.author?.publicIdentifier ?? undefined;
      return {
        externalId: String(t.id),
        url: t.linkedinUrl,
        title: firstLine(t.content),
        snippet: clip(t.content),
        author,
        postedAt:
          asNumber(t.postedAt?.timestamp) ??
          (Date.parse(t.postedAt?.date ?? "") || Date.now()),
        commentCount: asNumber(t.commentIds?.length),
        score: asNumber(t.reactions?.length),
      };
    });
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
  "instagram:community": fetchInstagramComments,
  "threads:keyword": searchThreads,
  "tiktok:community": fetchTiktokComments,
  "x:keyword": searchX,
  "x:community": fetchXAccountPosts,
  "linkedin:keyword": searchLinkedin,
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
      instagramAccounts: project.instagramAccounts,
      tiktokAccounts: project.tiktokAccounts,
      xAccounts: project.xAccounts,
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

// Testing helper: run exactly one job, ignoring intervals. Keeps paid
// platforms from firing when you only want to check one.
//   npx convex run fetchers:runOneJob '{"platform":"reddit","kind":"community","query":"saas"}' --prod
export const runOneJob = internalAction({
  args: { platform: v.string(), kind: v.string(), query: v.string() },
  handler: async (ctx, args): Promise<JobResult> => {
    const job: Doc<"jobs"> | null = await ctx.runQuery(
      internal.pipeline.jobByKey,
      args,
    );
    if (!job) return { ...args, error: "no such job" };
    return runJob(ctx, job);
  },
});
