"use client";

import { Check } from "lucide-react";
import {
  IntentBadge,
  timeAgo,
  type FeedRow,
} from "./posts-content";
import { PLATFORM_OPTIONS } from "./project-context";

// Rendered inside the History sheet on the dashboard; state lives in PostsContent.
export function HistoryPanel({
  rows,
  onUnmark,
}: {
  rows: FeedRow[];
  onUnmark: (row: FeedRow) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="border-b border-border px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
        {rows.length} replied {rows.length === 1 ? "post" : "posts"}
      </p>
      <ul className="slim-scrollbar min-h-0 flex-1 overflow-y-auto">
        {rows.map((row) => {
          const platform = PLATFORM_OPTIONS.find(
            (option) => option.id === row.post.platform,
          );
          return (
            <li
              key={row.match._id}
              className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0"
            >
              <div className="flex min-w-0 items-start gap-3">
                {platform ? (
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center"
                    style={{ backgroundColor: platform.bg }}
                  >
                    <platform.Icon
                      className="h-3.5 w-3.5"
                      style={{ color: platform.fg }}
                    />
                  </span>
                ) : null}
                <div className="min-w-0">
                  <a
                    href={row.post.url}
                    target="_blank"
                    rel="noreferrer"
                    className="line-clamp-2 text-sm font-medium hover:underline"
                  >
                    {row.post.title}
                  </a>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <IntentBadge match={row.match} />
                    {[row.post.subsource, timeAgo(row.post.postedAt)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onUnmark(row)}
                aria-label="Unmark as replied"
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border border-primary bg-primary text-primary-foreground transition-colors hover:bg-primary/80"
              >
                <Check className="h-4 w-4" />
              </button>
            </li>
          );
        })}
        {rows.length === 0 ? (
          <li className="px-4 py-12 text-center text-sm text-muted-foreground">
            Nothing marked as replied yet.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
