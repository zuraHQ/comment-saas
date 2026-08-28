import { SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardLink, useDashboardNavigation } from "./navigation";
import { ProjectIcon } from "./project-icon";
import { ProjectSwitcher } from "./project-switcher";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useProject } from "./project-context";

const PAGE_LABELS: Record<string, string> = {
  "/analytics": "Analytics",
  "/launchpad": "Launch sites",
  "/settings": "Settings",
  "/profile": "Profile",
};

export function DashboardTopbar() {
  const { pathname } = useDashboardNavigation();
  const { project } = useProject();
  const counts = useQuery(
    api.pipeline.feedCounts,
    project ? { projectId: project._id } : "skip",
  );
  const pageLabel = PAGE_LABELS[pathname];

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b px-4">
      <SidebarTrigger className="size-10 md:hidden [&_svg]:size-5!" />

      {pageLabel ? (
        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-2 text-sm md:flex"
        >
          <DashboardLink
            href="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </DashboardLink>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">{pageLabel}</span>
        </nav>
      ) : (
        <p className="hidden items-center gap-2 text-sm font-medium md:flex">
          <ProjectIcon project={project} />
          {project?.name ?? "no project"}
          <span className="text-muted-foreground">
            · {(counts?.total ?? 0).toLocaleString()} posts found
          </span>
        </p>
      )}

      <div className="ml-auto flex shrink-0 items-center">
        <ProjectSwitcher />
      </div>
    </header>
  );
}
