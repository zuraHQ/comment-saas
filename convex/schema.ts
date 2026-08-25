import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),

  // A user's product. Everything user-specific hangs off a project, and every
  // project belongs to exactly one Clerk user.
  projects: defineTable({
    ownerClerkId: v.string(),
    slug: v.string(),
    name: v.string(),
    color: v.string(),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
    keywords: v.array(v.string()),
    postTypes: v.array(v.string()),
    hideReplied: v.optional(v.boolean()),
  })
    .index("by_owner", ["ownerClerkId"])
    .index("by_owner_slug", ["ownerClerkId", "slug"]),

  // Global shared pool: public post data, fetched once ever (platform +
  // externalId). Deliberately not per-user — see ARCH.md.
  posts: defineTable({
    platform: v.string(),
    externalId: v.string(),
    url: v.string(),
    title: v.string(),
    snippet: v.optional(v.string()),
    author: v.optional(v.string()),
    subsource: v.optional(v.string()),
    postedAt: v.number(),
    fetchedByKeyword: v.string(),
    score: v.optional(v.number()),
    commentCount: v.optional(v.number()),
  })
    .index("by_platform_external", ["platform", "externalId"])
    .index("by_platform_posted", ["platform", "postedAt"]),

  // The per-user feed: which pooled posts belong to which project.
  matches: defineTable({
    projectId: v.id("projects"),
    ownerClerkId: v.string(),
    postId: v.id("posts"),
    keyword: v.string(),
    intentScore: v.optional(v.string()),
    replied: v.boolean(),
    postedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_post", ["projectId", "postId"])
    .index("by_project_posted", ["projectId", "postedAt"])
    .index("by_owner", ["ownerClerkId"]),

  // Globally deduped (platform, keyword) search jobs, shared across projects.
  searchJobs: defineTable({
    platform: v.string(),
    keyword: v.string(),
    lastRunAt: v.optional(v.number()),
  })
    .index("by_platform_keyword", ["platform", "keyword"])
    .index("by_platform", ["platform"]),

  // Posts the user has replied to. Keyed by post key (mock feed ids today,
  // match ids once the feed is live).
  repliedPosts: defineTable({
    projectId: v.id("projects"),
    ownerClerkId: v.string(),
    postKey: v.string(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_post", ["projectId", "postKey"]),

  // Which launch sites a project has been posted to. Per project, per user.
  launches: defineTable({
    projectId: v.id("projects"),
    ownerClerkId: v.string(),
    site: v.string(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_site", ["projectId", "site"]),

  // One tracked short link per reply; /r/[code] redirects to targetUrl.
  trackedLinks: defineTable({
    code: v.string(),
    projectId: v.id("projects"),
    ownerClerkId: v.string(),
    targetUrl: v.string(),
    platform: v.string(),
    label: v.optional(v.string()),
  })
    .index("by_code", ["code"])
    .index("by_project", ["projectId"]),

  linkClicks: defineTable({
    linkId: v.id("trackedLinks"),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  }).index("by_link", ["linkId"]),
});
