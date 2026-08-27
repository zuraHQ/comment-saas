import { query } from "./_generated/server";

// Unauthenticated on purpose: these are the aggregate numbers the landing page
// shows. Nothing here identifies a project or a user.
//
// Counting by collecting is fine at the current table sizes; if posts grow past
// a few tens of thousands this should move to a running counter row.
export const landing = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").collect();
    const matches = await ctx.db.query("matches").collect();
    const clicks = await ctx.db.query("linkClicks").collect();

    const platforms = new Set(posts.map((post) => post.platform));
    let lastFetchedAt = 0;
    for (const job of await ctx.db.query("jobs").collect()) {
      if (job.lastRunAt && job.lastRunAt > lastFetchedAt) {
        lastFetchedAt = job.lastRunAt;
      }
    }

    return {
      posts: posts.length,
      platforms: platforms.size,
      replies: matches.filter((match) => match.replied).length,
      clicks: clicks.length,
      lastFetchedAt: lastFetchedAt || null,
    };
  },
});
