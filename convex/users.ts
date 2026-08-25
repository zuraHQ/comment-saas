import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Called from the client on first authenticated load — no Clerk webhook
// needed for basic user sync.
export const ensure = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const fields = {
      name: identity.name ?? identity.email ?? "User",
      email: identity.email,
      imageUrl: identity.pictureUrl,
    };

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, fields);
      return existing._id;
    }
    return ctx.db.insert("users", { clerkId: identity.subject, ...fields });
  },
});

// The signed-in user's own row, reactive like every other Convex query.
export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

// Remembers which project the user was last looking at.
export const setLastProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (user) await ctx.db.patch(user._id, { lastProjectId: args.projectId });
  },
});
