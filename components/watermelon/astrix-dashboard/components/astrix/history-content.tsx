"use client";

import { Check } from "lucide-react";
import { ALL_PLATFORMS } from "./posts-content";

// Rendered inside the History sheet on the dashboard; state lives in PostsContent.
export function HistoryPanel({
  replied,
  onUnmark,
}: {
  replied: Set<string>;
  onUnmark: (id: string) => void;
}) {
  const rows = ALL_PLATFORMS.flatMap((platform) =>
    platform.posts
      .filter((post) => replied.has(post.id))
      .map((post) => ({ platform, post })),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="border-b border-border px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
        {rows.length} replied {rows.length === 1 ? "post" : "posts"}
      </p>
      <ul className="slim-scrollbar min-h-0 flex-1 overflow-y-auto">
        {rows.map(({ platform, post }) => (
          <li
            key={post.id}
            className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center"
                style={{ backgroundColor: platform.bg }}
              >
                <platform.Icon
                  className="h-3.5 w-3.5"
                  style={{ color: platform.iconColor }}
                />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{post.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {platform.name} · {post.community} · {post.time}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUnmark(post.id)}
              title="Unmark as replied"
              className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center border border-primary bg-primary text-primary-foreground transition-opacity hover:opacity-80"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
        {rows.length === 0 ? (
          <li className="px-4 py-12 text-center text-sm text-muted-foreground">
            Nothing here yet. Mark posts as replied to build your history.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
