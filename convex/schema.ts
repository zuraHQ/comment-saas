import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),

  // One tracked short link per reply; /r/[code] redirects to targetUrl.
  trackedLinks: defineTable({
    code: v.string(),
    projectId: v.string(),
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
