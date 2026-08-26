// Single source of truth for how each platform is fetched, so the job
// builders in projects.ts and pipeline.ts cannot drift apart.

// Platforms where we cannot read every post, so keywords are the way in.
// Threads is off: its Apify actor bills ~$0.48 per RUN regardless of
// result count, which the cron would turn into dollars a day.
export const KEYWORD_PLATFORMS = ["reddit", "bluesky", "github", "youtube", "x", "linkedin"];

// Minimum time between runs of one job, per platform. YouTube searches cost
// 100 of a 10k/day quota, so they run a few times a day, not every 15 min.
export const PLATFORM_MIN_INTERVAL_MS: Record<string, number> = {
  youtube: 6 * 60 * 60 * 1000,
  // Apify runs spend real credit, twice per day is plenty for comments.
  facebook: 12 * 60 * 60 * 1000,
  instagram: 12 * 60 * 60 * 1000,
  threads: 12 * 60 * 60 * 1000,
  tiktok: 12 * 60 * 60 * 1000,
  x: 12 * 60 * 60 * 1000,
  // LinkedIn's actor returns ~100 posts per query (~$0.20) regardless of
  // caps, so once a day per keyword is the budget.
  linkedin: 24 * 60 * 60 * 1000,
};

// Reddit is free through the official API but has a per-run floor on the
// Apify fallback, so its pace depends on which path is configured.
export function platformMinIntervalMs(platform: string): number {
  if (platform === "reddit") {
    return process.env.REDDIT_CLIENT_ID ? 0 : 24 * 60 * 60 * 1000;
  }
  return PLATFORM_MIN_INTERVAL_MS[platform] ?? 0;
}

// HN publishes only a few hundred stories a day, so we read all of it and
// need no keywords there at all.
export const HN_FEEDS = ["all", "ask", "show"];

// Communities (subreddits) are a Reddit concept for now.
export const COMMUNITY_PLATFORMS = ["reddit"];
