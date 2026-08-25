"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_PLATFORMS, REPLIED_STORAGE_KEY } from "./posts-content";

export function HistoryContent() {
  const [replied, setReplied] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const stored = localStorage.getItem(REPLIED_STORAGE_KEY);
      if (stored) setReplied(new Set(JSON.parse(stored)));
    } catch {
      // ignore corrupt storage
    }
  }, []);

  const unmark = (id: string) => {
    setReplied((prev) => {
      const next = new Set(prev);
      next.delete(id);
      localStorage.setItem(REPLIED_STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const rows = ALL_PLATFORMS.flatMap((platform) =>
    platform.posts
      .filter((post) => replied.has(post.id))
      .map((post) => ({ platform, post })),
  );

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold">History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every post you marked as replied, across all platforms.
        </p>
      </div>

      <section className="border border-border">
        <header className="border-b border-border px-4 py-3 text-sm font-medium">
          {rows.length} replied {rows.length === 1 ? "post" : "posts"}
        </header>
        <ul>
          {rows.map(({ platform, post }) => (
            <li
              key={post.id}
              className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0"
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
                    {platform.name} · {post.community} · {post.author} ·{" "}
                    {post.time}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => unmark(post.id)}
                title="Unmark as replied"
                className={cn(
                  "flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center border transition-colors",
                  "border-primary bg-primary text-primary-foreground hover:opacity-80",
                )}
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          {rows.length === 0 ? (
            <li className="px-4 py-12 text-center text-sm text-muted-foreground">
              Nothing here yet. Mark posts as replied from the dashboard.
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
