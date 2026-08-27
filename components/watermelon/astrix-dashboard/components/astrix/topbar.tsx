import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { History as HistoryIcon, RefreshCw, X as XIcon } from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { INTENT_FILTERS, useFeedFilter } from "./feed-filter";
import { HistoryPanel } from "./history-content";
import type { FeedRow } from "./posts-content";
import { DashboardLink, useDashboardNavigation } from "./navigation";
import { ProjectIcon } from "./project-icon";
import { ProjectSwitcher } from "./project-switcher";
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
  const pageLabel = PAGE_LABELS[pathname];

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b px-4 md:px-6 md:pr-8">
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
          <span className="text-muted-foreground">Looking posts for:</span>
          <ProjectIcon project={project} />
          {project?.name ?? "no project"}
        </p>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-3">
        {pageLabel ? null : <FeedControls />}
        <ProjectSwitcher />
      </div>
    </header>
  );
}

// Feed controls live in the topbar so the feed itself is all posts.
function FeedControls() {
  const { project } = useProject();
  const { intentFilter, setIntentFilter } = useFeedFilter();
  const refreshProject = useAction(api.fetchers.refreshProject);
  const setReplied = useMutation(api.pipeline.setReplied);
  const setSkipped = useMutation(api.pipeline.setSkipped);
  const [refreshing, setRefreshing] = useState(false);

  // Same query the feed uses, minus the platform filter, so History and
  // Skipped cover every platform. Convex dedupes it with the feed's own read.
  const rows = useQuery(
    api.pipeline.feed,
    project ? { projectId: project._id, limit: 300 } : "skip",
  );
  const repliedRows = (rows ?? []).filter((row) => row.match.replied);
  const skippedRows = (rows ?? []).filter(
    (row) => row.match.skipped && !row.match.replied,
  );

  const refresh = async () => {
    if (refreshing || !project) return;
    setRefreshing(true);
    try {
      await refreshProject({ projectId: project._id });
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="hidden items-center gap-3 lg:flex">
      <button
        type="button"
        onClick={refresh}
        aria-label="Refresh posts"
        disabled={refreshing}
        className="flex h-9 w-9 cursor-pointer items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground disabled:cursor-default"
      >
        <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
      </button>

      <div className="flex items-center">
        {INTENT_FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setIntentFilter(option)}
            aria-pressed={intentFilter === option}
            className={cn(
              "h-9 cursor-pointer border border-l-0 px-3 text-[10px] font-bold tracking-wider uppercase transition-colors first:border-l",
              intentFilter === option
                ? "border-border bg-sidebar-accent text-foreground"
                : "border-border text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <Sheet>
        <SheetTrigger
          type="button"
          aria-label="Skipped"
          className="flex h-9 w-9 cursor-pointer items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <XIcon className="size-4" />
        </SheetTrigger>
        <SheetContent
          side="right"
          className="astrix-dashboard flex w-full flex-col gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-border px-4 py-4">
            <SheetTitle className="text-base">Skipped</SheetTitle>
          </SheetHeader>
          <HistoryPanel
            rows={skippedRows}
            onUnmark={(row: FeedRow) =>
              setSkipped({ matchId: row.match._id, skipped: false }).catch(
                console.error,
              )
            }
            emptyText="Nothing skipped yet."
            countLabel="skipped"
          />
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger
          type="button"
          aria-label="History"
          className="flex h-9 w-9 cursor-pointer items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <HistoryIcon className="size-4" />
        </SheetTrigger>
        <SheetContent
          side="right"
          className="astrix-dashboard flex w-full flex-col gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-border px-4 py-4">
            <SheetTitle className="text-base">History</SheetTitle>
          </SheetHeader>
          <HistoryPanel
            rows={repliedRows}
            onUnmark={(row: FeedRow) =>
              setReplied({ matchId: row.match._id, replied: false }).catch(
                console.error,
              )
            }
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
