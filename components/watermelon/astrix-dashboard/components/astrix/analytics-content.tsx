"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PLATFORM_OPTIONS, useProject } from "./project-context";

export function AnalyticsContent() {
  const { project } = useProject();
  const sourceStats = useQuery(
    api.pipeline.sourceStats,
    project ? { projectId: project._id } : "skip",
  );
  const linkStats = useQuery(
    api.links.statsForProject,
    project ? { projectId: project._id } : "skip",
  );

  const links = linkStats ?? [];
  const realClicks = links.reduce((sum, link) => sum + link.clicks, 0);
  const clicksByPlatform = new Map<string, number>();
  for (const link of links) {
    clicksByPlatform.set(
      link.platform,
      (clicksByPlatform.get(link.platform) ?? 0) + link.clicks,
    );
  }
  const bestChannel =
    [...clicksByPlatform.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const maxPlatformClicks = Math.max(1, ...clicksByPlatform.values());
  const topLinks = [...links].sort((a, b) => b.clicks - a.clicks).slice(0, 8);


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

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Link clicks", value: realClicks.toLocaleString() },
          { label: "Tracked replies", value: links.length.toLocaleString() },
          {
            label: "Avg clicks per reply",
            value: links.length
              ? (realClicks / links.length).toFixed(1)
              : "0",
          },
          { label: "Best channel", value: bestChannel },
        ].map((tile) => (
          <div key={tile.label} className="border border-border p-4">
            <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              {tile.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{tile.value}</p>
          </div>
        ))}
      </div>

      {/* Clicks by platform */}
      <section className="border border-border">
        <header className="border-b border-border px-4 py-3 text-sm font-medium">
          Clicks by platform
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
                ) : null}
                <span className="w-24 shrink-0 truncate text-sm">
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
              No clicks yet. Paste a tracked link in a reply to start counting.
            </li>
          ) : null}
        </ul>
      </section>

      {/* Top comments by clicks */}
      <section className="border border-border">
        <header className="border-b border-border px-4 py-3 text-sm font-medium">
          Top comments by clicks
        </header>
        <ul>
          {topLinks.map((link) => (
            <li
              key={link.code}
              className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {link.label ?? link.targetUrl}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {link.platform} · /r/{link.code}
                </p>
              </div>
              <div className="shrink-0 text-right text-sm tabular-nums">
                <span className="font-medium">{link.clicks}</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  clicks
                </span>
              </div>
            </li>
          ))}
          {topLinks.length === 0 ? (
            <li className="px-4 py-6 text-sm text-muted-foreground">
              No tracked links yet.
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
