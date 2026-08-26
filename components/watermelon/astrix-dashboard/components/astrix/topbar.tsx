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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardLink, useDashboardNavigation } from "./navigation";
import { ProjectIcon } from "./project-icon";
import { useProject } from "./project-context";

const PAGE_LABELS: Record<string, string> = {
  "/analytics": "Analytics",
  "/launchpad": "Launchpad",
  "/settings": "Settings",
  "/ideas": "Ideas",
};

export function DashboardTopbar() {
  const { project, projects, setProjectId, addProject } = useProject();
  const { pathname, navigate } = useDashboardNavigation();
  const pageLabel = PAGE_LABELS[pathname];
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b px-4 md:px-6 md:pr-8">
      <SidebarTrigger className="size-10 md:hidden [&_svg]:size-5!" />

      <nav aria-label="Breadcrumb" className="hidden items-center gap-2 text-sm md:flex">
        <DashboardLink
          href="/"
          className={
            pageLabel
              ? "text-muted-foreground transition-colors hover:text-foreground"
              : "text-foreground"
          }
        >
          Dashboard
        </DashboardLink>
        {pageLabel ? (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">{pageLabel}</span>
          </>
        ) : null}
      </nav>

      <div className="ml-auto flex shrink-0 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className="flex h-10 items-center gap-2.5 border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-sidebar-accent"
            aria-label="Switch project"
          >
            <ProjectIcon project={project} />
            {project?.name ?? "No project"}
            <ChevronsUpDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
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
                  className="h-8 w-full border border-border bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring"
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
      </div>
    </header>
  );
}
