"use client";

import { cn } from "@/lib/utils";
import type { Project } from "./project-context";

// Uploaded icon when there is one, first letter otherwise.
export function ProjectIcon({
  project,
  className,
}: {
  project: Pick<Project, "name" | "iconUrl"> | null;
  className?: string;
}) {
  if (project?.iconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={project.iconUrl}
        alt=""
        className={cn("h-5 w-5 shrink-0 object-cover", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center bg-sidebar-accent text-[10px] font-bold text-foreground",
        className,
      )}
    >
      {project?.name?.[0]?.toUpperCase() ?? "+"}
    </span>
  );
}
