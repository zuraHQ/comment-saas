"use client";

import { useState } from "react";
import { Check, Globe, Link2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { PLATFORM_OPTIONS, useProject } from "./project-context";

export function AnalyticsContent() {
  const { project } = useProject();
  const sourceStats = useQuery(
    api.pipeline.sourceStats,
    project ? { projectId: project._id } : "skip",
  );
  const [range, setRange] = useState<number>(30);
  const breakdown = useQuery(
    api.links.clickBreakdown,
    project ? { projectId: project._id, days: range } : "skip",
  );
  const counts = useQuery(
    api.pipeline.feedCounts,
    project ? { projectId: project._id } : "skip",
  );

  const getProjectLink = useMutation(api.links.getProjectLink);
  const updateProject = useMutation(api.projects.update);
  const [copied, setCopied] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [linkFor, setLinkFor] = useState<string | null>(null);

  const hasUrl = Boolean(project?.url);

  const loadLink = async () => {
    if (!project) return;
    const result = await getProjectLink({ projectId: project._id });
    if ("error" in result) return;
    setLink(`${window.location.origin}${result.path}`);
  };

  // Mint the link once per project, the first time we render with a URL.
  if (project && hasUrl && linkFor !== project._id) {
    setLinkFor(project._id);
    void loadLink();
  }

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const saveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    const value = siteUrl.trim();
    if (!value) return;
    const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    await updateProject({ projectId: project._id, url });
    setSiteUrl("");
    void loadLink();
  };

  const realClicks = breakdown?.total ?? 0;
  const lastClick = breakdown?.lastClickAt
    ? new Date(breakdown.lastClickAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;
  const clicksByPlatform = new Map(Object.entries(breakdown?.byPlatform ?? {}));
  const bestChannel =
    [...clicksByPlatform.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const maxPlatformClicks = Math.max(1, ...clicksByPlatform.values());


  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Where {project?.name ?? "no project"}&apos;s visitors come from. Every reply gets a
          tracked link, so each click attributes back to the exact comment.
          Copy a tracked link on any post, paste it in your reply, and every
          click lands here.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center">
          {[
            { label: "7d", days: 7 },
            { label: "30d", days: 30 },
            { label: "90d", days: 90 },
          ].map((option) => (
            <button
              key={option.days}
              type="button"
              onClick={() => setRange(option.days)}
              aria-pressed={range === option.days}
              className={cn(
                "h-9 cursor-pointer border border-l-0 px-3 text-[10px] font-bold tracking-wider uppercase transition-colors first:border-l",
                range === option.days
                  ? "border-border bg-sidebar-accent text-foreground"
                  : "border-border text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        {lastClick ? (
          <span className="text-xs text-muted-foreground">
            Last click {lastClick}
          </span>
        ) : null}
      </div>

      {/* Your tracked link */}
      <section className="flex flex-col gap-3 border border-border p-5">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Link2 className="size-4" />
            Your tracked link
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use this instead of your normal URL when you reply to a post.
            Visitors land on your site as usual, and every click shows up below
            with the platform it came from.
          </p>
        </div>

        {hasUrl ? (
          <div className="flex flex-wrap items-center gap-3">
            <code className="min-w-0 flex-1 truncate border border-border bg-sidebar-accent/40 px-3 py-2 text-sm">
              {link ?? "..."}
            </code>
            <button
              type="button"
              onClick={() => void copy()}
              disabled={!link}
              className={cn(
                "flex h-9 shrink-0 cursor-pointer items-center gap-2 border px-4 text-xs font-bold tracking-wider uppercase transition-colors disabled:cursor-default disabled:opacity-50",
                copied
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              {copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
              {copied ? "Copied" : "Copy link"}
            </button>
            <p className="w-full text-xs text-muted-foreground">
              Redirects to{" "}
              <span className="text-foreground">{project?.url}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={saveUrl} className="flex flex-wrap items-center gap-3">
            <Input
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="yourproduct.com"
              className="h-9 min-w-0 flex-1 rounded-none"
            />
            <button
              type="submit"
              className="h-9 shrink-0 cursor-pointer border border-border px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              Save
            </button>
            <p className="w-full text-xs text-muted-foreground">
              Add your product URL to get a tracked link.
            </p>
          </form>
        )}
      </section>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Link clicks", value: realClicks.toLocaleString() },
          { label: "Best channel", value: bestChannel },
          {
            label: "Posts found",
            value: (counts?.total ?? 0).toLocaleString(),
          },
          {
            label: "Replied",
            value: (counts?.replied ?? 0).toLocaleString(),
          },
        ].map((tile) => (
          <div key={tile.label} className="border border-border p-4">
            <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              {tile.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{tile.value}</p>
          </div>
        ))}
      </div>

      <section className="border border-border">
        <header className="border-b border-border px-4 py-3 text-sm font-medium">
          Where your clicks came from
        </header>
        <ul className="flex flex-col gap-4 p-4">
          {[...clicksByPlatform.entries()].map(([platformId, clicks]) => {
            const meta = PLATFORM_OPTIONS.find((o) => o.id === platformId);
            return (
              <li key={platformId} className="flex items-center gap-3">
                {meta ? (
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center"
                    style={{ backgroundColor: meta.bg }}
                  >
                    <meta.Icon className="h-3.5 w-3.5" style={{ color: meta.fg }} />
                  </span>
                ) : (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-sidebar-accent">
                    {platformId === "direct" ? (
                      <Link2 className="h-3.5 w-3.5 text-foreground" />
                    ) : (
                      <Globe className="h-3.5 w-3.5 text-foreground" />
                    )}
                  </span>
                )}
                <span className="w-24 shrink-0 truncate text-sm capitalize">
                  {meta?.label ?? platformId}
                </span>
                <span className="relative h-4 flex-1 bg-white/5">
                  <span
                    className="bg-primary absolute inset-y-0 left-0"
                    style={{ width: `${(clicks / maxPlatformClicks) * 100}%` }}
                  />
                </span>
                <span className="w-16 shrink-0 text-right text-sm tabular-nums">
                  {clicks.toLocaleString()}
                </span>
              </li>
            );
          })}
          {clicksByPlatform.size === 0 ? (
            <li className="text-sm text-muted-foreground">
              No clicks yet. Copy your link on the dashboard, paste it in
              replies, and every click shows up here with its source.
            </li>
          ) : null}
        </ul>
      </section>

      {/* Live data: which communities and keywords actually produce leads */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SourceCard
          title="Communities"
          rows={sourceStats?.filter((row) => row.source === "community")}
          label={(row) =>
            row.query === "all" || row.query === "ask" || row.query === "show"
              ? `HN ${row.query}`
              : `r/${row.query}`
          }
        />
        <SourceCard
          title="Keywords"
          rows={sourceStats?.filter((row) => row.source === "keyword")}
          label={(row) => row.query}
        />
      </div>
    </div>
  );
}

type SourceRow = {
  source: string;
  query: string;
  total: number;
  high: number;
  medium: number;
  low: number;
  replied: number;
};

function SourceCard({
  title,
  rows,
  label,
}: {
  title: string;
  rows: SourceRow[] | undefined;
  label: (row: SourceRow) => string;
}) {
  return (
    <section className="border border-border">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {rows === undefined ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          Nothing fetched yet.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((row) => (
            <li
              key={row.query}
              className="flex items-center gap-3 px-4 py-3"
            >
              <span className="min-w-0 flex-1 truncate text-sm">
                {label(row)}
              </span>
              <span className="shrink-0 text-right text-sm tabular-nums">
                <span className="text-[#FF6600]">{row.high} high</span>
                <span className="text-muted-foreground">
                  {" "}· {row.medium} med · {row.total} found
                  {row.replied ? ` · ${row.replied} replied` : ""}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
