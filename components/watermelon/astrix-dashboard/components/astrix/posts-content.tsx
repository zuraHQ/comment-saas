"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { Check, History as HistoryIcon, RefreshCw } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { HistoryPanel } from "./history-content";
import { ProjectIcon } from "./project-icon";
import { PLATFORM_OPTIONS, useProject } from "./project-context";

export type FeedRow = { match: Doc<"matches">; post: Doc<"posts"> };

const INTENT_STYLES: Record<string, string> = {
  high: "bg-[#FF6600] text-[#101010]",
  medium: "bg-[#FFC53D] text-[#101010]",
  low: "bg-foreground/10 text-muted-foreground",
};

const INTENT_FILTERS = ["All", "High", "Medium", "Low"] as const;

export function timeAgo(timestamp: number): string {
  const seconds = Math.max(0, (Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.floor(minutes)}m ago`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  const days = hours / 24;
  if (days < 30) return `${Math.floor(days)}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function IntentBadge({ match }: { match: Doc<"matches"> }) {
  if (!match.intentScore) {
    return (
      <span className="shrink-0 border border-border px-2 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
        Scoring...
      </span>
    );
  }
  return (
    <span
      className={cn(
        "shrink-0 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase",
        INTENT_STYLES[match.intentScore] ?? INTENT_STYLES.low,
      )}
    >
      {match.intentScore} intent
    </span>
  );
}

export function PostsContent() {
  const { project } = useProject();

  const feed = useQuery(
    api.pipeline.feed,
    project ? { projectId: project._id, limit: 300 } : "skip",
  );
  const setReplied = useMutation(api.pipeline.setReplied);
  const refreshProject = useAction(api.fetchers.refreshProject);
  const setHideRepliedPref = useMutation(api.replies.setHideReplied);

  const rows = feed ?? [];

  // Rail: every live platform, always. What shows in the rail is navigation,
  // not a reflection of project config or fetched data.
  const platforms = PLATFORM_OPTIONS.filter((option) => option.live);
  const countFor = (id: string) =>
    rows.filter((row) => row.post.platform === id).length;

  const [pickedKey, setPickedKey] = useState<string | null>(null);
  const activeKey =
    pickedKey ??
    platforms.reduce(
      (best, option) =>
        countFor(option.id) > countFor(best) ? option.id : best,
      platforms[0]?.id ?? "reddit",
    );
  const active = platforms.find((option) => option.id === activeKey);

  const hideReplied = project?.hideReplied ?? false;
  const [intentFilter, setIntentFilter] =
    useState<(typeof INTENT_FILTERS)[number]>("All");
  const [refreshing, setRefreshing] = useState(false);

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

  const toggleReplied = (row: FeedRow) => {
    setReplied({ matchId: row.match._id, replied: !row.match.replied }).catch(
      console.error,
    );
  };

  const platformRows = rows.filter((row) => row.post.platform === activeKey);
  const visibleRows = platformRows.filter(
    (row) =>
      (!hideReplied || !row.match.replied) &&
      (intentFilter === "All" ||
        row.match.intentScore === intentFilter.toLowerCase()),
  );
  const repliedRows = rows.filter((row) => row.match.replied);

  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex min-h-0 flex-1 flex-col border border-border">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            Looking posts for:
            <ProjectIcon project={project} className="h-6 w-6 text-xs" />
            {project?.name ?? "no project"}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {rows.length} found
            </span>
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
            <button
              type="button"
              onClick={() => {
                if (!project) return;
                setHideRepliedPref({
                  projectId: project._id,
                  hideReplied: !hideReplied,
                }).catch(console.error);
              }}
              aria-pressed={hideReplied}
              className={cn(
                "h-9 px-3 text-[10px] font-bold tracking-wider uppercase transition-colors",
                hideReplied
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              Hide replied
            </button>
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
                <HistoryPanel rows={repliedRows} onUnmark={toggleReplied} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Platform rail */}
          <nav className="flex shrink-0 overflow-x-auto border-b border-border lg:w-56 lg:flex-col lg:overflow-visible lg:border-r lg:border-b-0">
            {platforms.map((platform) => {
              const isActive = platform.id === activeKey;
              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setPickedKey(platform.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "flex shrink-0 cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors",
                    isActive
                      ? "bg-sidebar-accent"
                      : "hover:bg-sidebar-accent/60",
                  )}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center"
                    style={{ backgroundColor: platform.bg }}
                  >
                    <platform.Icon
                      className="h-4 w-4"
                      style={{ color: platform.fg }}
                    />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{platform.label}</span>
                    <span className="text-xs text-muted-foreground">
                      Found {countFor(platform.id)} posts
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Post feed */}
          <section className="flex min-w-0 flex-1 flex-col">
            <ul className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
              {visibleRows.map((row) => (
                <li
                  key={row.match._id}
                  className="border-b border-border last:border-b-0"
                >
                  <a
                    href={row.post.url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "group block cursor-pointer px-4 py-4 transition-colors hover:bg-sidebar-accent/40",
                      row.match.replied && "opacity-50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-sm font-medium">
                            {row.post.title}
                          </p>
                          <IntentBadge match={row.match} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {row.post.type === "comment" ? "comment · " : ""}
                          {[
                            row.post.subsource,
                            row.post.author,
                            timeAgo(row.post.postedAt),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        {row.post.snippet ? (
                          <p className="mt-2 line-clamp-2 text-sm text-foreground/70">
                            {row.post.snippet}
                          </p>
                        ) : null}
                        {row.match.intentReason &&
                        row.match.intentScore !== "low" ? (
                          <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                            Why: {row.match.intentReason}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleReplied(row);
                        }}
                        aria-pressed={row.match.replied}
                        aria-label={
                          row.match.replied
                            ? "Replied, click to undo"
                            : "Mark as replied"
                        }
                        className={cn(
                          "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border transition-colors",
                          row.match.replied
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground/40 hover:border-foreground/40 hover:text-foreground",
                        )}
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    </div>
                  </a>
                </li>
              ))}
              {feed === undefined ? (
                Array.from({ length: 8 }, (_, i) => (
                  <li
                    key={i}
                    className="border-b border-border px-4 py-4 last:border-b-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="h-4 w-2/3 bg-sidebar-accent" />
                        <div className="mt-2 h-3 w-1/3 bg-sidebar-accent/70" />
                        <div className="mt-3 h-3 w-full bg-sidebar-accent/50" />
                        <div className="mt-1.5 h-3 w-4/5 bg-sidebar-accent/50" />
                      </div>
                      <div className="h-10 w-10 shrink-0 border border-border" />
                    </div>
                  </li>
                ))
              ) : visibleRows.length === 0 ? (
                <li className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {platformRows.length > 0
                    ? "Nothing matches the current filters."
                    : `No ${active?.label ?? ""} posts yet. They land here as we fetch.`}
                </li>
              ) : null}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
