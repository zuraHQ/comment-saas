"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, RefreshCw } from "lucide-react";
import {
  FaBluesky,
  FaGithub,
  FaHackerNews,
  FaLinkedinIn,
  FaQuora,
  FaThreads,
  FaYoutube,
  FaRedditAlien,
  FaXTwitter,
} from "react-icons/fa6";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { HistoryPanel } from "./history-content";
import { ProjectIcon } from "./project-icon";
import { useProject } from "./project-context";
import { api } from "@/convex/_generated/api";

type Post = {
  id: string;
  title: string;
  snippet: string;
  community: string;
  author: string;
  time: string;
  intent: "High" | "Medium" | "Low";
};

const PLATFORMS = [
  {
    key: "reddit",
    name: "Reddit",
    Icon: FaRedditAlien,
    bg: "#FF4500",
    iconColor: "#ffffff",
    posts: [
      {
        id: "r1",
        title: "What tools do you use to find customers for a new SaaS?",
        snippet:
          "I just launched my product and I'm struggling to get my first 10 users. Cold email feels dead. Where do you all find people actually looking for your kind of tool?",
        community: "r/SaaS",
        author: "u/buildinpublic_dev",
        time: "12m ago",
        intent: "High",
      },
      {
        id: "r2",
        title: "Is there a tool that monitors Reddit for mentions of my niche?",
        snippet:
          "Looking for something that pings me when someone asks a question my product solves. Tried F5Bot but the noise is unreal.",
        community: "r/EntrepreneurRideAlong",
        author: "u/nichehunter",
        time: "38m ago",
        intent: "High",
      },
      {
        id: "r3",
        title: "How do you do 'reply marketing' without getting banned?",
        snippet:
          "I keep seeing founders say they got their first customers from Reddit comments. Every time I try, mods remove my post. What's the etiquette?",
        community: "r/startups",
        author: "u/firsthundredusers",
        time: "1h ago",
        intent: "Medium",
      },
      {
        id: "r4",
        title: "Best way to track keywords across multiple subreddits?",
        snippet:
          "I want alerts for ~20 keywords across 15 subreddits, ranked by whether the poster actually wants to buy something.",
        community: "r/GrowthHacking",
        author: "u/kw_stalker",
        time: "2h ago",
        intent: "High",
      },
      {
        id: "r5",
        title: "Anyone recommend an alternative to Brand24 for a small budget?",
        snippet:
          "Solo founder here. $79/mo is steep for social listening. What are you all using for finding conversations to join?",
        community: "r/indiehackers",
        author: "u/ramen_profitable",
        time: "3h ago",
        intent: "Medium",
      },
      {
        id: "r6",
        title: "Launched on Product Hunt, now what?",
        snippet:
          "Got 200 upvotes but signups flatlined after day 2. Thinking about community-led growth next. Where should I focus?",
        community: "r/SaaS",
        author: "u/ph_hangover",
        time: "5h ago",
        intent: "Low",
      },
    ] satisfies Post[],
  },
  {
    key: "x",
    name: "X/Twitter",
    Icon: FaXTwitter,
    bg: "#ffffff",
    iconColor: "#000000",
    posts: [
      {
        id: "x1",
        title: "Is there a tool that finds tweets asking for product recs?",
        snippet:
          "There has to be something that surfaces 'what app do you use for X' tweets in my niche. Manual search is eating my mornings.",
        community: "@shipfast_sam",
        author: "12.4k followers",
        time: "9m ago",
        intent: "High",
      },
      {
        id: "x2",
        title: '"Anyone know a good CRM for freelancers?" is free money',
        snippet:
          "I replied to 5 tweets like this last week and got 3 demos booked. Someone should productize finding these.",
        community: "@indiegrowth",
        author: "8.1k followers",
        time: "44m ago",
        intent: "High",
      },
      {
        id: "x3",
        title: "Reply-guy marketing is underrated",
        snippet:
          "My last 20 customers all came from replying to questions on X within 10 minutes of them being posted. Speed is everything.",
        community: "@bootstrapbella",
        author: "23k followers",
        time: "2h ago",
        intent: "Medium",
      },
      {
        id: "x4",
        title: "Looking for beta testers for a scheduling tool",
        snippet:
          "DMs open. Especially want feedback from agencies juggling multiple client calendars.",
        community: "@calstackapp",
        author: "1.9k followers",
        time: "4h ago",
        intent: "Low",
      },
    ] satisfies Post[],
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    Icon: FaLinkedinIn,
    bg: "#0A66C2",
    iconColor: "#ffffff",
    posts: [
      {
        id: "l1",
        title: "Can anyone recommend a tool for social listening on a budget?",
        snippet:
          "Head of Growth at a 10-person SaaS. We need to know when prospects ask for products like ours. Agency quotes are wild.",
        community: "Maya Chen",
        author: "Head of Growth",
        time: "1h ago",
        intent: "High",
      },
      {
        id: "l2",
        title:
          "We got 14 demos last quarter just from answering questions online",
        snippet:
          "No ads. Just being genuinely helpful in threads where people asked for solutions. Founders sleep on this channel.",
        community: "Tom Okafor",
        author: "Founder, PipelineIQ",
        time: "4h ago",
        intent: "Medium",
      },
      {
        id: "l3",
        title: "Hiring a community manager to monitor Reddit and LinkedIn",
        snippet:
          "Half the job description is 'find conversations where we should show up.' Feels like software should do this part.",
        community: "Priya Nair",
        author: "VP Marketing",
        time: "9h ago",
        intent: "Medium",
      },
    ] satisfies Post[],
  },
  {
    key: "hn",
    name: "Hacker News",
    Icon: FaHackerNews,
    bg: "#FF6600",
    iconColor: "#ffffff",
    posts: [
      {
        id: "h1",
        title: "Ask HN: How do you find your first paying customers?",
        snippet:
          "Bootstrapped a monitoring tool over 6 months. Launch post got 12 upvotes. Cold outreach feels spammy. What actually worked for you?",
        community: "Ask HN",
        author: "184 points",
        time: "35m ago",
        intent: "High",
      },
      {
        id: "h2",
        title:
          "Ask HN: Best tool for tracking brand mentions across communities?",
        snippet:
          "Google Alerts misses almost everything on Reddit and HN. Is there something purpose-built that isn't enterprise-priced?",
        community: "Ask HN",
        author: "97 points",
        time: "2h ago",
        intent: "High",
      },
      {
        id: "h3",
        title: "Show HN: I built a CLI to search HN comments semantically",
        snippet:
          "Side project using the Algolia dump plus embeddings. Curious if anyone would pay for alerts on top of this.",
        community: "Show HN",
        author: "61 points",
        time: "5h ago",
        intent: "Medium",
      },
    ] satisfies Post[],
  },
  {
    key: "youtube",
    name: "YouTube",
    Icon: FaYoutube,
    bg: "#FF0000",
    iconColor: "#ffffff",
    posts: [
      {
        id: "y1",
        title:
          "I tried 7 tools to find customers on Reddit, here's what worked",
        snippet:
          "Comment section is full of founders asking for recommendations. Great thread to be helpful in.",
        community: "@growthjourney",
        author: "48k views",
        time: "1h ago",
        intent: "High",
      },
      {
        id: "y2",
        title: "How I got my first 100 SaaS customers without ads",
        snippet:
          "Comments asking 'what tool did you use to monitor mentions?' keep piling up under this one.",
        community: "@bootstrapdiaries",
        author: "112k views",
        time: "6h ago",
        intent: "High",
      },
      {
        id: "y3",
        title: "Reply marketing tutorial for indie hackers",
        snippet:
          "Viewers in the comments trading subreddit lists and asking for automation tools.",
        community: "@microsaaslab",
        author: "23k views",
        time: "1d ago",
        intent: "Medium",
      },
    ] satisfies Post[],
  },
  {
    key: "threads",
    name: "Threads",
    Icon: FaThreads,
    bg: "#ffffff",
    iconColor: "#000000",
    posts: [
      {
        id: "t1",
        title: "Does anyone know an app that tracks keyword mentions here?",
        snippet:
          "The API finally exists but I haven't seen a good alerts tool built on it yet. Want pings when people ask for recs in my niche.",
        community: "@growthgabi",
        author: "9.4k followers",
        time: "26m ago",
        intent: "High",
      },
      {
        id: "t2",
        title: "Asked for a CRM rec this morning, got 60 replies by lunch",
        snippet:
          "Threads engagement for question posts is unreal right now. Brands that answer fast are winning customers here.",
        community: "@saasscout",
        author: "15k followers",
        time: "3h ago",
        intent: "Medium",
      },
      {
        id: "t3",
        title: "Moving our community content strategy to Threads",
        snippet:
          "Early-platform reach is too good to ignore. Documenting what works for B2B as we go.",
        community: "@b2bplaybook",
        author: "4.2k followers",
        time: "8h ago",
        intent: "Low",
      },
    ] satisfies Post[],
  },
  {
    key: "bluesky",
    name: "Bluesky",
    Icon: FaBluesky,
    bg: "#0085FF",
    iconColor: "#ffffff",
    posts: [
      {
        id: "b1",
        title: "Migrating my audience here. What analytics tools exist yet?",
        snippet:
          "The ecosystem is young. Half my SaaS stack has no Bluesky equivalent. Feels like a gold rush for builders honestly.",
        community: "@growthnerd.bsky.social",
        author: "3.2k followers",
        time: "21m ago",
        intent: "High",
      },
      {
        id: "b2",
        title: "Who's building social listening for the AT Protocol?",
        snippet:
          "Firehose access makes this so much easier than the other platforms. Surprised nobody has shipped a polished keyword-alert tool.",
        community: "@protodev.bsky.social",
        author: "5.7k followers",
        time: "1h ago",
        intent: "High",
      },
      {
        id: "b3",
        title: "Asked for project management recs and got 40 replies",
        snippet:
          "This place has the early-Twitter helpfulness. If you're a founder, the people answering questions here are winning.",
        community: "@remotepm.bsky.social",
        author: "980 followers",
        time: "3h ago",
        intent: "Medium",
      },
      {
        id: "b4",
        title: "Feature request threads are a goldmine for competitor gaps",
        snippet:
          "Reading complaints about the big incumbents and taking notes. Every thread is a roadmap item.",
        community: "@saasdetective.bsky.social",
        author: "2.1k followers",
        time: "6h ago",
        intent: "Low",
      },
    ] satisfies Post[],
  },
  {
    key: "github",
    name: "GitHub",
    Icon: FaGithub,
    bg: "#ffffff",
    iconColor: "#000000",
    posts: [
      {
        id: "g1",
        title: "Is there a hosted alternative to running this ourselves?",
        snippet:
          "We love the project but our team doesn't want to maintain the infra. Would happily pay for a managed version with SSO.",
        community: "vercel/next.js",
        author: "Discussion",
        time: "48m ago",
        intent: "High",
      },
      {
        id: "g2",
        title: "Recommendations for a lightweight feature-flag service?",
        snippet:
          "LaunchDarkly is overkill for our 4-person team. Looking for something simple that plays nice with Next.js middleware.",
        community: "community/community",
        author: "Discussion",
        time: "3h ago",
        intent: "High",
      },
      {
        id: "g3",
        title: "How are you all handling webhook retries in production?",
        snippet:
          "Rolling our own queue feels wrong. Curious what services people plug in before we build it ourselves.",
        community: "trigger/trigger.dev",
        author: "Discussion",
        time: "7h ago",
        intent: "Medium",
      },
    ] satisfies Post[],
  },
  {
    key: "quora",
    name: "Quora",
    Icon: FaQuora,
    bg: "#B92B27",
    iconColor: "#ffffff",
    posts: [
      {
        id: "q1",
        title: "What is the best tool to monitor Reddit for keywords in 2026?",
        snippet:
          "I run a small SaaS and want alerts when people ask for a product like mine. Free or cheap options preferred.",
        community: "Social Media Marketing",
        author: "23 followers",
        time: "2h ago",
        intent: "High",
      },
      {
        id: "q2",
        title: "How do startups get their first 100 customers without ads?",
        snippet:
          "Every answer says 'communities' but nobody explains how to actually find the right threads at the right time.",
        community: "Startup Growth",
        author: "156 followers",
        time: "6h ago",
        intent: "Medium",
      },
      {
        id: "q3",
        title: "Is comment marketing on Quora still effective?",
        snippet:
          "Seeing mixed opinions. Some say answers rank on Google for years, others say the traffic is gone.",
        community: "Digital Marketing",
        author: "41 followers",
        time: "1d ago",
        intent: "Low",
      },
    ] satisfies Post[],
  },
] as const;

// Deterministic filler so every platform has ~15 posts while we tune the UX.
const FILLER: Array<Pick<Post, "title" | "snippet" | "intent">> = [
  {
    title: "What's your stack for finding early users?",
    snippet:
      "Curious what tools people actually keep paying for after month one.",
    intent: "High",
  },
  {
    title: "Tools to monitor competitor mentions across communities?",
    snippet:
      "We keep hearing about lost deals a week too late. Want same-day visibility.",
    intent: "High",
  },
  {
    title: "Best alternative to expensive social listening suites?",
    snippet:
      "Enterprise pricing for what feels like a saved search. There must be something leaner.",
    intent: "High",
  },
  {
    title: "Keyword alerts that actually filter noise, do they exist?",
    snippet:
      "Every tool I try floods me with irrelevant matches. I want intent, not volume.",
    intent: "High",
  },
  {
    title: "Anyone using AI to draft community replies?",
    snippet:
      "Half tempted, half worried it will read as spam. Experiences welcome.",
    intent: "Medium",
  },
  {
    title: "Is engaging in niche communities worth it for B2B?",
    snippet:
      "Our ICP hangs out in maybe five places online. Trying to justify the time spend.",
    intent: "Medium",
  },
  {
    title: "Where do you find beta testers these days?",
    snippet:
      "Launch platforms feel tapped out. Looking for fresher watering holes.",
    intent: "Medium",
  },
  {
    title: "Sharing my playbook for turning threads into signups",
    snippet:
      "Reply fast, be useful first, mention the product last. Numbers inside.",
    intent: "Medium",
  },
  {
    title: "Underrated growth channels in 2026?",
    snippet:
      "Paid is brutal, SEO is AI-flooded. What is quietly working for you?",
    intent: "Medium",
  },
  {
    title: "How do you reply to prospects without sounding like an ad?",
    snippet:
      "The line between helpful and salesy is thin. Curious how others walk it.",
    intent: "Medium",
  },
  {
    title: "How much time do you spend on community marketing weekly?",
    snippet: "Trying to benchmark before I commit a full day per week to it.",
    intent: "Low",
  },
  {
    title: "Do founders still do things that don't scale?",
    snippet:
      "Feels like everyone automates everything now. Is manual outreach dead?",
    intent: "Low",
  },
];

const FILLER_SOURCES: Record<
  string,
  Array<{ community: string; author: string }>
> = {
  reddit: [
    { community: "r/SaaS", author: "u/foundermode" },
    { community: "r/startups", author: "u/zerotoone_dev" },
    { community: "r/Entrepreneur", author: "u/sidehustlesam" },
    { community: "r/marketing", author: "u/funnelfixer" },
  ],
  x: [
    { community: "@launchweekly", author: "6.2k followers" },
    { community: "@microsaasguy", author: "18k followers" },
    { community: "@gtm_notes", author: "3.4k followers" },
  ],
  bluesky: [
    { community: "@founderlog.bsky.social", author: "1.8k followers" },
    { community: "@growthlab.bsky.social", author: "4.5k followers" },
  ],
  hn: [
    { community: "Ask HN", author: "72 points" },
    { community: "Ask HN", author: "38 points" },
    { community: "Show HN", author: "121 points" },
  ],
  youtube: [
    { community: "@founderclips", author: "31k views" },
    { community: "@saasbuilders", author: "9.4k views" },
  ],
  github: [
    { community: "supabase/supabase", author: "Discussion" },
    { community: "calcom/cal.com", author: "Discussion" },
    { community: "plausible/analytics", author: "Discussion" },
  ],
  linkedin: [
    { community: "Diego Ramos", author: "Growth Lead" },
    { community: "Sofia Lindqvist", author: "Founder, MetricsHQ" },
    { community: "James Wu", author: "Demand Gen Manager" },
  ],
  quora: [
    { community: "SaaS Marketing", author: "64 followers" },
    { community: "Growth Hacking", author: "112 followers" },
    { community: "Lead Generation", author: "37 followers" },
  ],
  threads: [
    { community: "@buildinpublicdaily", author: "11k followers" },
    { community: "@thegtmgirl", author: "7.7k followers" },
  ],
};

const FILLER_TIMES = [
  "4h ago",
  "6h ago",
  "9h ago",
  "12h ago",
  "16h ago",
  "20h ago",
  "1d ago",
  "1d ago",
  "2d ago",
  "2d ago",
  "3d ago",
  "3d ago",
];

export const ALL_PLATFORMS = PLATFORMS.map((platform) => {
  const sources = FILLER_SOURCES[platform.key] ?? [];
  const fillers: Post[] = FILLER.slice(
    0,
    Math.max(0, 15 - platform.posts.length),
  ).map((f, i) => ({
    id: `${platform.key}-f${i}`,
    ...f,
    ...sources[i % sources.length],
    time: FILLER_TIMES[i % FILLER_TIMES.length],
  }));
  return { ...platform, posts: [...platform.posts, ...fillers] };
});

const INTENT_STYLES: Record<Post["intent"], string> = {
  High: "bg-primary text-primary-foreground",
  Medium: "bg-foreground/10 text-foreground/80",
  Low: "bg-foreground/5 text-muted-foreground",
};

function postUrl(platform: string, community: string) {
  if (platform === "reddit") return `https://www.reddit.com/${community}/`;
  if (platform === "x") return `https://x.com/${community.slice(1)}`;
  if (platform === "hn") return "https://news.ycombinator.com/ask";
  if (platform === "github")
    return `https://github.com/${community}/discussions`;
  if (platform === "linkedin") return "https://www.linkedin.com/feed/";
  if (platform === "quora") return "https://www.quora.com/";
  if (platform === "threads") return `https://www.threads.net/${community}`;
  if (platform === "youtube") return `https://www.youtube.com/${community}`;
  return `https://bsky.app/profile/${community.slice(1)}`;
}

export function PostsContent() {
  const { project } = useProject();
  const [activeKey, setActiveKey] = useState<(typeof PLATFORMS)[number]["key"]>(
    PLATFORMS[0].key,
  );
  const active = ALL_PLATFORMS.find((p) => p.key === activeKey)!;

  // Replied markers and the hide-replied preference live in Convex, per project.
  const repliedList = useQuery(
    api.replies.listForProject,
    project ? { projectId: project._id } : "skip",
  );
  const toggleReplied_ = useMutation(api.replies.toggle);
  const setHideRepliedPref = useMutation(api.replies.setHideReplied);

  const replied = new Set(repliedList ?? []);
  const hideReplied = project?.hideReplied ?? false;

  const [refreshing, setRefreshing] = useState(false);
  const [updatedLabel, setUpdatedLabel] = useState("2m ago");
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    },
    [],
  );

  // Simulated refetch until the real fetchers exist.
  const refresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    refreshTimer.current = setTimeout(() => {
      setRefreshing(false);
      setUpdatedLabel("just now");
    }, 800);
  };

  const toggleReplied = (id: string) => {
    if (!project) return;
    toggleReplied_({ projectId: project._id, postKey: id }).catch(
      console.error,
    );
  };

  const visiblePosts = active.posts.filter(
    (post) => !hideReplied || !replied.has(post.id),
  );

  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex min-h-0 flex-1 flex-col border border-border">
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            Looking posts for:
            <ProjectIcon project={project} className="h-6 w-6 text-xs" />
            {project?.name ?? "no project"}
          </h1>
          <Sheet>
            <SheetTrigger
              type="button"
              className="h-9 cursor-pointer border border-border px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              History
            </SheetTrigger>
            <SheetContent
              side="right"
              className="astrix-dashboard flex w-full flex-col gap-0 p-0 sm:max-w-md"
            >
              <SheetHeader className="border-b border-border px-4 py-4">
                <SheetTitle className="text-base">History</SheetTitle>
              </SheetHeader>
              <HistoryPanel replied={replied} onUnmark={toggleReplied} />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Platform rail */}
          <nav className="flex shrink-0 overflow-x-auto border-b border-border lg:w-56 lg:flex-col lg:overflow-visible lg:border-r lg:border-b-0">
            {ALL_PLATFORMS.map((platform) => {
              const isActive = platform.key === activeKey;
              return (
                <button
                  key={platform.key}
                  type="button"
                  onClick={() => setActiveKey(platform.key)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "flex min-w-fit items-center gap-3 px-4 py-3 text-left transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                  )}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center"
                    style={{ backgroundColor: platform.bg }}
                  >
                    <platform.Icon
                      className="h-4 w-4"
                      style={{ color: platform.iconColor }}
                    />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{platform.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Found {platform.posts.length} posts
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Post feed */}
          <section className="flex min-w-0 flex-1 flex-col">
            <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center"
                style={{ backgroundColor: active.bg }}
              >
                <active.Icon
                  className="h-3.5 w-3.5"
                  style={{ color: active.iconColor }}
                />
              </span>
              <span className="text-sm font-medium">
                Found {active.posts.length} posts
                {visiblePosts.length !== active.posts.length ? (
                  <span className="text-muted-foreground">
                    {" "}
                    · showing {visiblePosts.length}
                  </span>
                ) : null}
              </span>

              <div className="ml-auto flex items-center gap-3">
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  Updated {updatedLabel}
                </span>
                <button
                  type="button"
                  onClick={refresh}
                  aria-label="Refresh posts"
                  disabled={refreshing}
                  className="flex h-6 w-6 cursor-pointer items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground disabled:cursor-default"
                >
                  <RefreshCw
                    className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!project) return;
                    setHideRepliedPref({
                      projectId: project._id,
                      hideReplied: !hideReplied,
                    }).catch(console.error);
                  }}
                  aria-pressed={hideReplied}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase transition-colors",
                    hideReplied
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                  )}
                >
                  Hide replied
                </button>
              </div>
            </header>

            <ul className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
              {visiblePosts.map((post) => (
                <li
                  key={post.id}
                  className="border-b border-border last:border-b-0"
                >
                  <a
                    href={postUrl(active.key, post.community)}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "group block cursor-pointer px-4 py-4 transition-colors hover:bg-sidebar-accent/40",
                      replied.has(post.id) && "opacity-50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-sm font-medium">
                            {post.title}
                          </p>
                          <span
                            className={cn(
                              "shrink-0 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                              INTENT_STYLES[post.intent],
                            )}
                          >
                            {post.intent} intent
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {post.community} · {post.author} · {post.time}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm text-foreground/70">
                          {post.snippet}
                        </p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleReplied(post.id);
                            }}
                            aria-pressed={replied.has(post.id)}
                            aria-label={
                              replied.has(post.id)
                                ? "Replied, click to undo"
                                : "Mark as replied"
                            }
                            className={cn(
                              "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border transition-colors",
                              replied.has(post.id)
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-muted-foreground/40 hover:border-foreground/40 hover:text-foreground",
                            )}
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="left"
                          className="astrix-dashboard"
                        >
                          {replied.has(post.id)
                            ? "Replied, click to undo"
                            : "Mark as replied"}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </a>
                </li>
              ))}
              {visiblePosts.length === 0 ? (
                <li className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Nothing matches the current filters.
                </li>
              ) : null}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
