import { SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardLink, useDashboardNavigation } from "./navigation";
import { ProjectSwitcher } from "./project-switcher";

const PAGE_LABELS: Record<string, string> = {
  "/analytics": "Analytics",
  "/launchpad": "Launchpad",
  "/settings": "Settings",
  "/profile": "Profile",
};

export function DashboardTopbar() {
  const { pathname } = useDashboardNavigation();
  const pageLabel = PAGE_LABELS[pathname];

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
        <ProjectSwitcher />
      </div>
    </header>
  );
}
