# Architecture: Data Acquisition & Post Pipeline

How we find posts across platforms, at what cost, and who the data belongs to.
Decided 2026-08-25.

## Core decision: shared post pool, per-project matching

Two users with overlapping niches (e.g. two CRM tools) want *the same posts*.
So scraping is never per-user — the pool is global, matching is per-project.

- **Global `posts` table** (Convex), keyed by `platform + externalId`.
  A post is fetched once, ever. Cost grows with the *keyword universe*, not
  user count. This is what makes rate limits and costs survivable.
- **Per-project `matches` table**: `projectId + postId + intentScore`.
  When a post enters the pool it is matched against every project whose
  keywords hit it. A new user with common keywords instantly gets backfill
  from the existing pool — feels magic on day one.
- **Query-driven fetching, deduped globally**: each project defines keywords;
  we maintain a global set of unique `(platform, keyword)` search jobs.
  Ten users tracking "CRM" = one search job, not ten.

Pure per-user scraping is the trap: costs scale linearly with users while
hammering the same endpoints redundantly.

## Scheduling: crons are the backbone, on-demand is the cherry

- **Convex crons per platform** walk the unique keyword jobs within each
  platform's rate limits. Fast platforms (Reddit, X) every 10–15 min; slower
  ones hourly. Reply speed is the product's core value, so cron frequency on
  fast platforms is effectively a product feature.
- **On-demand refresh**: the dashboard refresh button triggers an immediate
  fetch for *that project's keywords only*, with a cooldown (2–5 min) so
  users can't DDoS our own rate limits.

## Pipeline stages

```
fetch (Convex action, per platform+keyword)
  → normalize to a common Post shape
  → dedupe against pool (platform + externalId)
  → intent scoring (cheap LLM, e.g. Haiku: High/Medium/Low + relevance per project)
  → write matches rows
  → UI reads reactively via Convex queries (feed updates live)
```

The intent scorer is the moat — fetching is commodity.

## Platform access matrix

APIs first-class wherever they exist. Firecrawl/scraping only where they don't.

| Platform | Method | Notes |
|---|---|---|
| Reddit | Official API (or public `.json` endpoints to start) | Free tier ~100 req/min |
| Hacker News | Algolia API (`hn.algolia.com`) | Free, no auth — easiest win |
| Bluesky | AT Protocol `searchPosts` via `public.api.bsky.app` | Free; auth optional but improves results |
| YouTube | Data API v3: `search.list` + `commentThreads` | Free 10k units/day; a search costs 100 units → budget ~100 searches/day |
| dev.to | Forem API | Free |
| GitHub Discussions | GraphQL API | Free |
| Threads | Official API `keyword_search` | Requires Meta app review — start paperwork early |
| X/Twitter | Paid API, or managed scraper (Apify actor) | Self-hosted scrapers (Scweet/twikit) break every 2–4 weeks and risk account bans — don't build core product on them |
| LinkedIn | None viable | No API, scraping aggressively policed → manual-assist feature only |
| Quora | None viable | No API, anti-scraping → manual-assist / Firecrawl experiments, last |

**Firecrawl's role (hybrid policy):** enriching a single known URL (full thread
content for the intent scorer) and long-tail sites without APIs. Never bulk
discovery on platforms that have APIs.

**Managed scrapers (Apify) over random GitHub scraper repos** for the hostile
platforms (X, LinkedIn, Quora): repos rot, actors are maintained because
someone is paid to maintain them, and they absorb the ban/breakage arms race.

## Build order

1. **HN** — free, no auth; proves the entire pipeline end to end.
2. **Reddit** — the core channel, official API.
3. **Intent scoring** — the differentiator; do it as soon as two platforms flow.
4. **Bluesky + dev.to + YouTube** — breadth, all free APIs.
5. **Threads** (after app review), **X** (when paying for access is justified).
6. **LinkedIn / Quora** — manual-assist features, not crawlers.

## Related pieces already built

- Tracked reply links: `trackedLinks` / `linkClicks` tables + `/r/[code]`
  redirect (click attribution per comment). Signup attribution deferred until
  a customer-site snippet/webhook exists — analytics shows clicks only.
- Dashboard feed, refresh button (currently simulated → becomes the on-demand
  fetch trigger), per-project replied tracking (localStorage → move to Convex
  with auth).
