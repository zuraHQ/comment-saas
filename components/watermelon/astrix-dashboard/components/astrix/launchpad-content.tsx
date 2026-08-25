"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useProject } from "./project-context";

const LAUNCH_SITES: Array<{ name: string; domain: string; url?: string }> = [
  { name: "Product Hunt", domain: "producthunt.com" },
  { name: "Hacker News (Show HN)", domain: "news.ycombinator.com" },
  { name: "r/SideProject", domain: "reddit.com", url: "https://www.reddit.com/r/SideProject/" },
  { name: "r/SaaS", domain: "reddit.com", url: "https://www.reddit.com/r/SaaS/" },
  { name: "Peerlist Launchpad", domain: "peerlist.io" },
  { name: "Uneed", domain: "uneed.best" },
  { name: "BetaList", domain: "betalist.com" },
  { name: "Indie Hackers", domain: "indiehackers.com" },
  { name: "Microlaunch", domain: "microlaunch.net" },
  { name: "Fazier", domain: "fazier.com" },
  { name: "Tiny Launch", domain: "tinylaun.ch" },
  { name: "Dev Hunt", domain: "devhunt.org" },
  { name: "Tiny Startups", domain: "tinystartups.com" },
  { name: "r/alphaandbetausers", domain: "reddit.com", url: "https://www.reddit.com/r/alphaandbetausers/" },
  { name: "There's An AI For That", domain: "theresanaiforthat.com" },
  { name: "Toolify", domain: "toolify.ai" },
  { name: "AlternativeTo", domain: "alternativeto.net" },
  { name: "SaaSHub", domain: "saashub.com" },
  { name: "StartupBase", domain: "startupbase.io" },
  { name: "r/startups", domain: "reddit.com", url: "https://www.reddit.com/r/startups/" },
  { name: "r/EntrepreneurRideAlong", domain: "reddit.com", url: "https://www.reddit.com/r/EntrepreneurRideAlong/" },
  { name: "r/IMadeThis", domain: "reddit.com", url: "https://www.reddit.com/r/IMadeThis/" },
  { name: "dev.to", domain: "dev.to" },
  { name: "Launching Next", domain: "launchingnext.com" },
  { name: "Smol Launch", domain: "smollaunch.com" },
  { name: "SideProjectors", domain: "sideprojectors.com" },
  { name: "Startup Ranking", domain: "startupranking.com" },
  { name: "BetaPage", domain: "betapage.co" },
  { name: "voting.dev", domain: "voting.dev" },
  { name: "Crunchbase", domain: "crunchbase.com" },
];

const LAUNCHED_STORAGE_KEY = "launched-sites";

export function LaunchpadContent() {
  const { project } = useProject();

  // Map of projectId -> launched site names, loaded after mount to match SSR.
  const [launched, setLaunched] = useState<Record<string, string[]>>({});
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LAUNCHED_STORAGE_KEY);
      if (stored) setLaunched(JSON.parse(stored));
    } catch {
      // ignore corrupt storage
    }
  }, []);

  const projectLaunched = new Set(launched[project.id] ?? []);

  const toggleLaunched = (siteName: string) => {
    setLaunched((prev) => {
      const current = new Set(prev[project.id] ?? []);
      if (current.has(siteName)) current.delete(siteName);
      else current.add(siteName);
      const next = { ...prev, [project.id]: [...current] };
      localStorage.setItem(LAUNCHED_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold">Launchpad</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          30 places to launch your product for free and get your first users.
          Ranked from most popular to least, so start at the top.
        </p>
        <p className="mt-2 text-sm">
          <span className="text-primary font-semibold">
            {projectLaunched.size}
          </span>{" "}
          <span className="text-muted-foreground">
            of {LAUNCH_SITES.length} launched for
          </span>{" "}
          <span className="text-primary">{project.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {LAUNCH_SITES.map((site) => {
          const isLaunched = projectLaunched.has(site.name);
          return (
            <div
              key={`${site.domain}-${site.name}`}
              className={cn(
                "flex flex-col border transition-colors",
                isLaunched ? "border-primary/40" : "border-border",
              )}
            >
              <a
                href={site.url ?? `https://${site.domain}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-sidebar-accent/60"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=64`}
                  alt=""
                  className={cn("h-6 w-6 shrink-0", isLaunched && "opacity-60")}
                />
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block truncate text-sm font-medium",
                      isLaunched && "text-muted-foreground",
                    )}
                  >
                    {site.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {site.domain}
                  </span>
                </span>
              </a>
              <button
                type="button"
                onClick={() => toggleLaunched(site.name)}
                aria-pressed={isLaunched}
                className={cn(
                  "border-t px-4 py-2 text-left text-[10px] font-bold tracking-wider uppercase transition-colors",
                  isLaunched
                    ? "border-primary/40 text-primary hover:text-primary/70"
                    : "border-border text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                {isLaunched
                  ? `\u2713 ${project.name} launched here`
                  : "Mark as launched"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
