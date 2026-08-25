import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

// Every user-facing function goes through these: no identity, no data.
export async function requireClerkId(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not signed in");
  return identity.subject;
}

export async function requireOwnedProject(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
) {
  const clerkId = await requireClerkId(ctx);
  const project = await ctx.db.get(projectId);
  if (!project || project.ownerClerkId !== clerkId) {
    throw new Error("Project not found");
  }
  return project;
}
