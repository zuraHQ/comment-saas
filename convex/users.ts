import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

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

export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (user) await ctx.db.patch(user._id, { onboardedAt: Date.now() });
  },
});

// Testing helper, CLI only:
//   npx convex run users:resetOnboarding '{}' --prod
//   npx convex run users:resetOnboarding '{"wipeProjects":true}' --prod
export const resetOnboarding = internalMutation({
  args: { email: v.optional(v.string()), wipeProjects: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    const targets = args.email
      ? users.filter((u) => u.email === args.email)
      : users;

    for (const user of targets) {
      await ctx.db.patch(user._id, {
        onboardedAt: undefined,
        lastProjectId: undefined,
      });

      if (!args.wipeProjects) continue;
      const projects = await ctx.db
        .query("projects")
        .withIndex("by_owner", (q) => q.eq("ownerClerkId", user.clerkId))
        .collect();
      for (const project of projects) {
        for (const table of ["matches", "launches", "repliedPosts"] as const) {
          const rows = await ctx.db
            .query(table)
            .withIndex("by_project", (q) => q.eq("projectId", project._id))
            .collect();
          for (const row of rows) await ctx.db.delete(row._id);
        }
        await ctx.db.delete(project._id);
      }
    }
    return { reset: targets.length, wipedProjects: args.wipeProjects ?? false };
  },
});

// Flip a user-level integration on or off.
export const setIntegration = mutation({
  args: { integration: v.string(), enabled: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return;
    const current = new Set(user.integrations ?? []);
    if (args.enabled) current.add(args.integration);
    else current.delete(args.integration);
    await ctx.db.patch(user._id, { integrations: [...current] });

    // The toggle means "fetch this platform": keep every project in sync so
    // flipping it here is enough to start (or stop) the jobs.
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerClerkId", identity.subject))
      .collect();
    for (const project of projects) {
      const platforms = new Set(project.platforms);
      if (args.enabled) platforms.add(args.integration);
      else platforms.delete(args.integration);
      if (platforms.size !== project.platforms.length) {
        await ctx.db.patch(project._id, { platforms: [...platforms] });
      }
    }
  },
});

// One-shot CLI helper: take platforms off every project that has them.
export const disablePlatformsForAll = internalMutation({
  args: { platforms: v.array(v.string()) },
  handler: async (ctx, args) => {
    let updated = 0;
    for (const project of await ctx.db.query("projects").collect()) {
      const kept = project.platforms.filter((p) => !args.platforms.includes(p));
      if (kept.length !== project.platforms.length) {
        await ctx.db.patch(project._id, { platforms: kept });
        updated++;
      }
    }
    return updated;
  },
});

// One-shot CLI helper: add platforms to every project that lacks them.
export const enablePlatformsForAll = internalMutation({
  args: { platforms: v.array(v.string()) },
  handler: async (ctx, args) => {
    let updated = 0;
    for (const project of await ctx.db.query("projects").collect()) {
      const merged = [...new Set([...project.platforms, ...args.platforms])];
      if (merged.length !== project.platforms.length) {
        await ctx.db.patch(project._id, { platforms: merged });
        updated++;
      }
    }
    return updated;
  },
});
