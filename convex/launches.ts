import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireOwnedProject } from "./auth";

export const listForProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    const rows = await ctx.db
      .query("launches")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return rows.map((r) => r.site);
  },
});

// Marking a site launched is a toggle: insert or delete the row.
export const toggle = mutation({
  args: { projectId: v.id("projects"), site: v.string() },
  handler: async (ctx, args) => {
    const project = await requireOwnedProject(ctx, args.projectId);
    const existing = await ctx.db
      .query("launches")
      .withIndex("by_project_site", (q) =>
        q.eq("projectId", args.projectId).eq("site", args.site),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    }
    await ctx.db.insert("launches", {
      projectId: args.projectId,
      ownerClerkId: project.ownerClerkId,
      site: args.site,
    });
    return true;
  },
});
