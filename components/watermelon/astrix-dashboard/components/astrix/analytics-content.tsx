"use client";

import {
  FaBluesky,
  FaHackerNews,
  FaLinkedinIn,
  FaRedditAlien,
  FaXTwitter,
} from "react-icons/fa6";
import { useProject } from "./project-context";

// Mock attribution data until tracked reply links feed this page.
// Every reply gets a unique short link; clicks log against it.
const PLATFORM_CLICKS = [
  { name: "Reddit", Icon: FaRedditAlien, chip: "#FF4500", iconColor: "#ffffff", clicks: 1284 },
  { name: "X/Twitter", Icon: FaXTwitter, chip: "#ffffff", iconColor: "#000000", clicks: 507 },
  { name: "LinkedIn", Icon: FaLinkedinIn, chip: "#0A66C2", iconColor: "#ffffff", clicks: 342 },
  { name: "HN", Icon: FaHackerNews, chip: "#FF6600", iconColor: "#ffffff", clicks: 296 },
  { name: "Bluesky", Icon: FaBluesky, chip: "#0085FF", iconColor: "#ffffff", clicks: 118 },
];

const TOP_COMMENTS = [
  {
    id: "c1",
    post: "What tools do you use to find customers for a new SaaS?",
    community: "r/SaaS",
    platform: "Reddit",
    clicks: 214,
    time: "3d ago",
  },
  {
    id: "c2",
    post: "Can anyone recommend a tool for social listening on a budget?",
    community: "LinkedIn",
    platform: "LinkedIn",
    clicks: 121,
    time: "5d ago",
  },
  {
    id: "c3",
    post: "Ask HN: Best tool for tracking brand mentions across communities?",
    community: "Ask HN",
    platform: "HN",
    clicks: 98,
    time: "1w ago",
  },
  {
    id: "c4",
    post: "Is there a tool that finds tweets asking for product recs?",
    community: "@shipfast_sam",
    platform: "X/Twitter",
    clicks: 87,
    time: "1w ago",
  },
  {
    id: "c5",
    post: "Is there a tool that monitors Reddit for mentions of my niche?",
    community: "r/EntrepreneurRideAlong",
    platform: "Reddit",
    clicks: 64,
    time: "2w ago",
  },
];

export function AnalyticsContent() {
  const { project } = useProject();

  const totalClicks = PLATFORM_CLICKS.reduce((sum, p) => sum + p.clicks, 0);
  const maxClicks = Math.max(...PLATFORM_CLICKS.map((p) => p.clicks));
  const trackedReplies = 42; // mock total
  const avgClicks = Math.round(totalClicks / trackedReplies);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Where {project.name}&apos;s visitors come from. Every reply gets a
          tracked link, so each click attributes back to the exact comment.
          Sample data until tracked links are live.
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Link clicks", value: totalClicks.toLocaleString() },
          { label: "Tracked replies", value: trackedReplies.toLocaleString() },
          { label: "Avg clicks per reply", value: avgClicks.toLocaleString() },
          { label: "Best channel", value: "Reddit" },
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
          {PLATFORM_CLICKS.map((platform) => (
            <li key={platform.name} className="flex items-center gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center"
                style={{ backgroundColor: platform.chip }}
              >
                <platform.Icon
                  className="h-3.5 w-3.5"
                  style={{ color: platform.iconColor }}
                />
              </span>
              <span className="w-24 shrink-0 truncate text-sm">
                {platform.name}
              </span>
              <span className="relative h-4 flex-1 bg-white/5">
                <span
                  className="bg-primary absolute inset-y-0 left-0"
                  style={{ width: `${(platform.clicks / maxClicks) * 100}%` }}
                />
              </span>
              <span className="w-16 shrink-0 text-right text-sm tabular-nums">
                {platform.clicks.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Top comments by clicks */}
      <section className="border border-border">
        <header className="border-b border-border px-4 py-3 text-sm font-medium">
          Top comments by clicks
        </header>
        <ul>
          {TOP_COMMENTS.map((comment) => (
            <li
              key={comment.id}
              className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{comment.post}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {comment.platform} · {comment.community} · replied{" "}
                  {comment.time}
                </p>
              </div>
              <div className="shrink-0 text-right text-sm tabular-nums">
                <span className="text-primary">{comment.clicks}</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  clicks
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
