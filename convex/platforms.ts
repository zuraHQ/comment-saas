// Single source of truth for how each platform is fetched, so the job
// builders in projects.ts and pipeline.ts cannot drift apart.

// Platforms where we cannot read every post, so keywords are the way in.
export const KEYWORD_PLATFORMS = ["reddit", "bluesky", "github", "youtube", "threads"];

// Minimum time between runs of one job, per platform. YouTube searches cost
// 100 of a 10k/day quota, so they run a few times a day, not every 15 min.
export const PLATFORM_MIN_INTERVAL_MS: Record<string, number> = {
  youtube: 6 * 60 * 60 * 1000,
  // Apify runs spend real credit, twice per day is plenty for comments.
  facebook: 12 * 60 * 60 * 1000,
  instagram: 12 * 60 * 60 * 1000,
  threads: 12 * 60 * 60 * 1000,
  tiktok: 12 * 60 * 60 * 1000,
};

// HN publishes only a few hundred stories a day, so we read all of it and
// need no keywords there at all.
export const HN_FEEDS = ["all", "ask", "show"];

// Communities (subreddits) are a Reddit concept for now.
export const COMMUNITY_PLATFORMS = ["reddit"];
