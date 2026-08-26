// Single source of truth for how each platform is fetched, so the job
// builders in projects.ts and pipeline.ts cannot drift apart.

// Platforms where we cannot read every post, so keywords are the way in.
export const KEYWORD_PLATFORMS = ["reddit", "bluesky", "github"];

// HN publishes only a few hundred stories a day, so we read all of it and
// need no keywords there at all.
export const HN_FEEDS = ["all", "ask", "show"];

// Communities (subreddits) are a Reddit concept for now.
export const COMMUNITY_PLATFORMS = ["reddit"];
