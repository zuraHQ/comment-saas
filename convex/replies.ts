import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireOwnedProject } from "./auth";

export const listForProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    const rows = await ctx.db
      .query("repliedPosts")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return rows.map((r) => r.postKey);
  },
});

export const toggle = mutation({
  args: { projectId: v.id("projects"), postKey: v.string() },
  handler: async (ctx, args) => {
    const project = await requireOwnedProject(ctx, args.projectId);
    const existing = await ctx.db
      .query("repliedPosts")
      .withIndex("by_project_post", (q) =>
        q.eq("projectId", args.projectId).eq("postKey", args.postKey),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    }
    await ctx.db.insert("repliedPosts", {
      projectId: args.projectId,
      ownerClerkId: project.ownerClerkId,
      postKey: args.postKey,
    });
    return true;
  },
});

// Per-project UI preference (the "hide replied" toggle).
export const setHideReplied = mutation({
  args: { projectId: v.id("projects"), hideReplied: v.boolean() },
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    await ctx.db.patch(args.projectId, { hideReplied: args.hideReplied });
  },
});
