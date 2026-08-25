"use client";

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

export function LaunchpadContent() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold">Launchpad</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          30 places to launch your product for free and get your first users.
          Ranked from most popular to least, so start at the top.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {LAUNCH_SITES.map((site, index) => (
          <a
            key={`${site.domain}-${site.name}`}
            href={site.url ?? `https://${site.domain}`}
            target="_blank"
            rel="noreferrer"
            className="group flex cursor-pointer flex-col gap-3 border border-border p-4 transition-colors hover:bg-sidebar-accent/60"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground">
                #{index + 1}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=64`}
                alt=""
                className="h-6 w-6 shrink-0"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {site.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {site.domain}
                </span>
              </span>
            </div>
            <span className="text-primary text-[10px] font-bold tracking-wider uppercase opacity-70 transition-opacity group-hover:opacity-100">
              Submit your product
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
