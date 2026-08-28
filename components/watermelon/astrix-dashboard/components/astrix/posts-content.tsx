"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  ArrowUpRight,
  Check,
  PenLine,
  Eye,
  EyeOff,
  Copy,
  RotateCw,
  History as HistoryIcon,
  RefreshCw,
  X as XIcon,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
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
  const [rewritingId, setRewritingId] = useState<string | null>(null);
  const [showReplies, setShowReplies] = useState(true);
  const writeDraft = useAction(api.replyDrafter.draft);

  // Ask for a fresh draft of the same post, replacing the stored one.
  const rewrite = (matchId: Id<"matches">) => {
    setRewritingId(matchId);
    writeDraft({ matchId, force: true })
      .catch(console.error)
      .finally(() => setRewritingId((id) => (id === matchId ? null : id)));
  };

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
    (row) => !row.match.replied && !row.match.skipped,
  );
  const repliedRows = rows.filter((row) => row.match.replied);
  const skippedRows = rows.filter(
    (row) => row.match.skipped && !row.match.replied,
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
          <button
            type="button"
            onClick={refresh}
            aria-label="Refresh posts"
            disabled={refreshing}
            className="flex h-9 w-9 cursor-pointer items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground disabled:cursor-default"
          >
            <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
          </button>

          {/* Always on, so the one button that costs money is never a mystery */}
          <span className="relative ml-1 hidden items-center border border-border bg-popover px-2 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase sm:flex">
            <span className="absolute top-1/2 -left-[5px] size-2 -translate-y-1/2 rotate-45 border-b border-l border-border bg-popover" />
            {refreshing ? "Fetching..." : "Refresh data"}
          </span>

          <Sheet>
            <SheetTrigger
              type="button"
              aria-label={`Skipped, ${skippedRows.length} posts`}
              className="relative ml-auto flex h-9 w-9 cursor-pointer items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <XIcon className="size-4" />
              {skippedRows.length ? (
                <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-accent px-1.5 text-[10px] font-bold text-foreground">
                  {skippedRows.length > 99 ? "99+" : skippedRows.length}
                </span>
              ) : null}
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
              aria-label={`History, ${repliedRows.length} replied`}
              className="relative flex h-9 w-9 cursor-pointer items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <HistoryIcon className="size-4" />
              {repliedRows.length ? (
                <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-accent px-1.5 text-[10px] font-bold text-foreground">
                  {repliedRows.length > 99 ? "99+" : repliedRows.length}
                </span>
              ) : null}
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
          <button
            type="button"
            onClick={() => setShowReplies((v) => !v)}
            aria-pressed={showReplies}
            className="flex h-9 cursor-pointer items-center gap-2 border border-border px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            {showReplies ? (
              <Eye className="size-3.5" />
            ) : (
              <EyeOff className="size-3.5" />
            )}
            Preview replies
          </button>
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
                <div className="mt-2 h-1.5 w-full rounded-full bg-sidebar-accent">
                  <div
                    className="bg-brand h-full rounded-full transition-[width] duration-500"
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
            <ul className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
              {visibleRows.map((row) => {
                const platform =
                  PLATFORM_BY_ID[row.match.platform ?? row.post.platform];
                const reply = row.match.draft;
                return (
                  <li
                    key={row.match._id}
                    className={cn(
                      "flex flex-col border-b border-border last:border-b-0 transition-colors hover:bg-sidebar-accent/20",
                      row.match.replied && "opacity-50",
                    )}
                  >
                    <div className="relative flex flex-1 flex-col p-4">
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
                        className="cursor-pointer after:absolute after:inset-0 after:content-['']"
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="flex min-w-0 items-center gap-2">
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
                                row.post.type === "comment"
                                  ? "comment"
                                  : "post",
                                row.post.subsource,
                                row.post.author,
                                timeAgo(row.post.postedAt),
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </span>
                          {row.match.seenAt ? (
                            <span className="text-brand shrink-0 text-[10px] tracking-wider uppercase">
                              Seen
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-2 block text-sm font-medium">
                          {row.post.title}
                        </span>
                        {row.post.snippet &&
                        row.post.platform !== "reddit" &&
                        row.post.platform !== "hn" ? (
                          <span className="mt-2 line-clamp-2 block text-sm text-foreground/70">
                            {row.post.snippet}
                          </span>
                        ) : null}
                      </a>

                      {/* The draft, once there is one */}
                      {reply && showReplies ? (
                        <div className="mt-3 flex flex-1 gap-3">
                          <span className="mt-1 w-px shrink-0 bg-border" />
                          <p className="min-w-0 flex-1 text-sm leading-relaxed text-foreground/85">
                            {reply}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex gap-2 px-4 pb-4 text-[10px] font-bold tracking-wider uppercase">
                      <button
                        type="button"
                        onClick={() =>
                          reply
                            ? copyReply(row.match._id, reply)
                            : rewrite(row.match._id)
                        }
                        disabled={rewritingId === row.match._id}
                        className={cn(
                          "flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border px-3 transition-colors hover:bg-sidebar-accent disabled:cursor-default disabled:opacity-40",
                          copiedId === row.match._id
                            ? "text-brand"
                            : "text-muted-foreground",
                        )}
                      >
                        {rewritingId === row.match._id ? (
                          <>
                            <RotateCw className="size-3.5 animate-spin" />
                            Writing
                          </>
                        ) : copiedId === row.match._id ? (
                          <>
                            <Check className="size-3.5" />
                            Copied
                          </>
                        ) : reply ? (
                          <>
                            <Copy className="size-3.5" />
                            Copy reply
                          </>
                        ) : (
                          <>
                            <PenLine className="size-3.5" />
                            Write reply
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleReplied(row)}
                        aria-pressed={row.match.replied}
                        className={cn(
                          "flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 transition-colors hover:bg-sidebar-accent",
                          row.match.replied
                            ? "border-brand/50 text-brand"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        <Check className="size-3.5" />
                        {row.match.replied ? "Replied" : "Mark"}
                      </button>
                      <button
                        type="button"
                        onClick={() => skip(row)}
                        className="ml-auto flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-red-400"
                      >
                        <XIcon className="size-3.5" /> Skip
                      </button>
                    </div>
                  </li>
                );
              })}
              {feed === undefined ? (
                Array.from({ length: 8 }, (_, i) => (
                  <li
                    key={i}
                    className="border-b border-border last:border-b-0"
                  >
                    <div className="p-4">
                      <div className="h-3 w-1/3 bg-sidebar-accent" />
                      <div className="mt-3" />
                      <div className="h-4 w-2/3 bg-sidebar-accent" />
                      <div className="mt-3 h-3 w-full bg-sidebar-accent/50" />
                      <div className="mt-1.5 h-3 w-4/5 bg-sidebar-accent/50" />
                      <div className="mt-4 border border-border p-3">
                        <div className="h-3 w-11/12 bg-sidebar-accent/50" />
                        <div className="mt-1.5 h-3 w-3/5 bg-sidebar-accent/50" />
                      </div>
                    </div>
                    <div className="flex gap-2 px-4 pb-4">
                      <div className="h-9 w-28 border border-border" />
                      <div className="h-9 w-20 border border-border" />
                    </div>
                  </li>
                ))
              ) : visibleRows.length === 0 ? (
                <li className="py-12 text-center text-sm text-muted-foreground">
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
