"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  Check,
  Copy,
  History as HistoryIcon,
  RefreshCw,
  X as XIcon,
} from "lucide-react";
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
import { ProjectIcon } from "./project-icon";
import { PLATFORM_OPTIONS, useProject } from "./project-context";
import { INTENT_FILTERS, useFeedFilter } from "./feed-filter";
import { HistoryPanel } from "./history-content";

export type FeedRow = { match: Doc<"matches">; post: Doc<"posts"> };

const PLATFORM_BY_ID = Object.fromEntries(
  PLATFORM_OPTIONS.map((option) => [option.id, option]),
);

const INTENT_STYLES: Record<string, string> = {
  high: "bg-[#FF6600] text-[#101010]",
  medium: "bg-[#FFC53D] text-[#101010]",
  low: "bg-foreground/10 text-muted-foreground",
};

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

// Rail subtitle suffix: when this platform last fetched anything.
function platformLabel(
  status: { lastRunAt: number | null } | undefined,
): string {
  if (!status) return " · off";
  if (!status.lastRunAt) return " · never run";
  return ` · ${timeAgo(status.lastRunAt)}`;
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyReply = (id: string, text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
      })
      .catch(console.error);
  };

  const counts = useQuery(
    api.pipeline.feedCounts,
    project ? { projectId: project._id } : "skip",
  );
  const platformStatus = useQuery(
    api.pipeline.platformStatus,
    project ? { projectId: project._id } : "skip",
  );
  // Flip the cached feed instantly; Convex confirms (or rolls back) behind it.
  const setReplied = useMutation(api.pipeline.setReplied).withOptimisticUpdate(
    (localStore, args) => {
      for (const { args: queryArgs, value } of localStore.getAllQueries(
        api.pipeline.feed,
      )) {
        if (!value) continue;
        localStore.setQuery(
          api.pipeline.feed,
          queryArgs,
          value.map((row) =>
            row.match._id === args.matchId
              ? { ...row, match: { ...row.match, replied: args.replied } }
              : row,
          ),
        );
      }
    },
  );
  const { intentFilter, setIntentFilter } = useFeedFilter();
  const refreshProject = useAction(api.fetchers.refreshProject);
  const markSeen = useMutation(api.pipeline.markSeen);
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
  const setSkipped = useMutation(api.pipeline.setSkipped).withOptimisticUpdate(
    (localStore, args) => {
      for (const { args: queryArgs, value } of localStore.getAllQueries(
        api.pipeline.feed,
      )) {
        if (!value) continue;
        localStore.setQuery(
          api.pipeline.feed,
          queryArgs,
          value.map((row) =>
            row.match._id === args.matchId
              ? { ...row, match: { ...row.match, skipped: args.skipped } }
              : row,
          ),
        );
      }
    },
  );

  // Rail: every live platform, always. What shows in the rail is navigation,
  // not a reflection of project config or fetched data.
  const platforms = PLATFORM_OPTIONS.filter((option) => option.live);
  const countFor = (id: string) => counts?.byPlatform?.[id] ?? 0;

  const [pickedKey, setPickedKey] = useState<string | null>(null);
  const activeKey =
    pickedKey ??
    platforms.reduce(
      (best, option) =>
        countFor(option.id) > countFor(best) ? option.id : best,
      platforms[0]?.id ?? "reddit",
    );
  const active = platforms.find((option) => option.id === activeKey);

  // Only the active platform's rows are loaded; switching tabs re-queries.
  const feed = useQuery(
    api.pipeline.feed,
    project
      ? { projectId: project._id, platform: activeKey, limit: 200 }
      : "skip",
  );
  const rows = feed ?? [];

  const skip = (row: FeedRow) => {
    setSkipped({ matchId: row.match._id, skipped: true }).catch(console.error);
  };

  const unskip = (row: FeedRow) => {
    setSkipped({ matchId: row.match._id, skipped: false }).catch(console.error);
  };

  const toggleReplied = (row: FeedRow) => {
    setReplied({ matchId: row.match._id, replied: !row.match.replied }).catch(
      console.error,
    );
  };

  const platformRows = rows;
  // Replied and skipped posts leave the feed automatically; the History and
  // Skipped panels hold them.
  const visibleRows = platformRows.filter(
    (row) =>
      !row.match.replied &&
      !row.match.skipped &&
      (intentFilter === "All" ||
        row.match.intentScore === intentFilter.toLowerCase()),
  );
  const repliedRows = rows.filter((row) => row.match.replied);
  const skippedRows = rows.filter(
    (row) => row.match.skipped && !row.match.replied,
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
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
            onClick={refresh}
            aria-label="Refresh posts"
            disabled={refreshing}
            className="flex h-9 w-9 cursor-pointer items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground disabled:cursor-default"
          >
            <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
          </button>

          <Sheet>
            <SheetTrigger
              type="button"
              aria-label="Skipped"
              className="ml-auto flex h-9 w-9 cursor-pointer items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
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
                onUnmark={unskip}
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
              <HistoryPanel rows={repliedRows} onUnmark={toggleReplied} />
            </SheetContent>
          </Sheet>
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
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium">
                      {platform.label}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {countFor(platform.id)} posts
                      {platformLabel(platformStatus?.[platform.id])}
                    </span>
                  </span>
                </button>
              );
            })}
            {counts && counts.total - counts.scored > 0 ? (
              <div className="hidden border-t border-border px-4 py-3 lg:mt-auto lg:block">
                <p className="text-xs text-muted-foreground">
                  Scoring {counts.total - counts.scored} posts...
                </p>
                <div className="mt-2 h-1.5 w-full bg-sidebar-accent">
                  <div
                    className="h-full bg-primary transition-[width] duration-500"
                    style={{
                      width: `${Math.round((counts.scored / counts.total) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ) : null}
          </nav>

          {/* Post feed */}
          <section className="flex min-w-0 flex-1 flex-col">
            <ul className="no-scrollbar grid min-h-0 flex-1 auto-rows-min grid-cols-1 content-start gap-3 overflow-y-auto p-3 xl:grid-cols-2">
              {visibleRows.map((row) => {
                const platform =
                  PLATFORM_BY_ID[row.match.platform ?? row.post.platform];
                const reply = row.match.draft;
                return (
                  <li
                    key={row.match._id}
                    className={cn(
                      "relative flex flex-col border border-border bg-card transition-colors hover:border-foreground/25",
                      row.match.replied && "opacity-50",
                    )}
                  >
                    <a
                      href={row.post.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => {
                        if (!row.match.seenAt) {
                          markSeen({ matchId: row.match._id }).catch(
                            console.error,
                          );
                        }
                      }}
                      className="flex flex-1 cursor-pointer flex-col after:absolute after:inset-0 after:content-['']"
                    >
                      <header className="flex items-center justify-between gap-3 px-4 pt-4">
                        <div className="flex min-w-0 items-center gap-2">
                          {platform ? (
                            <span className="relative flex size-4 shrink-0 items-center justify-center">
                              {platform.id === "hn" ? (
                                <span className="absolute inset-px bg-white" />
                              ) : null}
                              <platform.Icon
                                className="relative size-4"
                                style={{ color: platform.bg }}
                              />
                            </span>
                          ) : null}
                          <span className="truncate text-xs text-muted-foreground">
                            {[
                              row.post.type === "comment" ? "comment" : "post",
                              row.post.subsource,
                              row.post.author,
                              timeAgo(row.post.postedAt),
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </div>
                        {row.match.seenAt ? (
                          <span className="shrink-0 bg-[#7dd3fc] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#101010] uppercase">
                            Seen
                          </span>
                        ) : null}
                      </header>

                      <div className="flex-1 px-4 pt-2 pb-4">
                        <p className="text-sm font-medium">{row.post.title}</p>
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
                        {reply ? (
                          <p className="mt-4 border border-border bg-background p-3 text-sm text-foreground/75">
                            {reply}
                          </p>
                        ) : null}
                      </div>
                    </a>

                    <div className="relative z-10 flex items-center justify-end gap-2 px-4 pb-4">
                      <button
                        type="button"
                        onClick={() => reply && copyReply(row.match._id, reply)}
                        disabled={!reply}
                        aria-label="Copy reply"
                        className={cn(
                          "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border transition-colors disabled:cursor-default disabled:opacity-40",
                          copiedId === row.match._id
                            ? "border-primary text-primary"
                            : "border-border text-muted-foreground/40 hover:border-foreground/40 hover:text-foreground",
                        )}
                      >
                        {copiedId === row.match._id ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleReplied(row)}
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
                      <button
                        type="button"
                        onClick={() => skip(row)}
                        aria-label="Skip this post"
                        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border border-border text-muted-foreground/40 transition-colors hover:border-red-500/40 hover:text-red-400"
                      >
                        <XIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                );
              })}
              {feed === undefined ? (
                Array.from({ length: 8 }, (_, i) => (
                  <li key={i} className="border border-border bg-card">
                    <div className="flex items-center justify-between gap-3 bg-sidebar-accent/40 px-4 py-2.5">
                      <div className="h-3 w-1/3 bg-sidebar-accent" />
                      <div className="h-4 w-20 bg-sidebar-accent" />
                    </div>
                    <div className="p-4">
                      <div className="h-4 w-2/3 bg-sidebar-accent" />
                      <div className="mt-3 h-3 w-full bg-sidebar-accent/50" />
                      <div className="mt-1.5 h-3 w-4/5 bg-sidebar-accent/50" />
                      <div className="mt-4 border border-border p-3">
                        <div className="h-3 w-11/12 bg-sidebar-accent/50" />
                        <div className="mt-1.5 h-3 w-3/5 bg-sidebar-accent/50" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 px-4 pb-4">
                      <div className="h-10 w-10 border border-border" />
                      <div className="h-10 w-10 border border-border" />
                      <div className="h-10 w-10 border border-border" />
                    </div>
                  </li>
                ))
              ) : visibleRows.length === 0 ? (
                <li className="col-span-full py-12 text-center text-sm text-muted-foreground">
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
