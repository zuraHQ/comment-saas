"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useDashboardNavigation } from "./navigation";
import { ProjectIcon } from "./project-icon";
import { useProject } from "./project-context";

// Switch, create, or jump to the settings of a project.
export function ProjectSwitcher({
  align = "end",
  className,
}: {
  align?: "start" | "end";
  className?: string;
}) {
  const { project, projects, setProjectId, addProject } = useProject();
  const { navigate } = useDashboardNavigation();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        className={cn(
          "flex h-10 cursor-pointer items-center gap-2.5 border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-sidebar-accent rounded-lg",
          className,
        )}
        aria-label="Switch project"
      >
        <ProjectIcon project={project} />
        {project?.name ?? "No project"}
        <ChevronsUpDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        collisionPadding={16}
        className="astrix-dashboard w-56"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Projects</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {projects.map((p) => (
            <DropdownMenuItem key={p._id} onSelect={() => setProjectId(p._id)}>
              <ProjectIcon project={p} />
              <span className="flex-1">{p.name}</span>
              {p._id === project?._id ? <Check className="size-4" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {creating ? (
          <form
            className="p-1"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newName.trim()) return;
              await addProject(newName);
              setNewName("");
              setCreating(false);
              navigate("/settings");
            }}
          >
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setCreating(false);
                  setNewName("");
                }
              }}
              placeholder="Project name"
              className="h-8 w-full border border-border bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring rounded-lg"
            />
          </form>
        ) : (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setCreating(true);
            }}
          >
            <Plus className="size-4" />
            New project
          </DropdownMenuItem>
        )}
        {project ? (
          <DropdownMenuItem onSelect={() => navigate("/settings")}>
            <Settings className="size-4" />
            {project.name} settings
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
