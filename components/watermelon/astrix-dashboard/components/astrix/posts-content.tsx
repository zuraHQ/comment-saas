"use client";

import { useState } from "react";
import { FaBluesky, FaRedditAlien, FaXTwitter } from "react-icons/fa6";
import { cn } from "@/lib/utils";

// Placeholder until onboarding stores the user's product.
const SAAS_NAME = "Acme";

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
        title: "\"Anyone know a good CRM for freelancers?\" is free money",
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
] as const;

const INTENT_STYLES: Record<Post["intent"], string> = {
  High: "bg-primary text-primary-foreground",
  Medium: "bg-foreground/10 text-foreground/80",
  Low: "bg-foreground/5 text-muted-foreground",
};

export function PostsContent() {
  const [activeKey, setActiveKey] = useState<(typeof PLATFORMS)[number]["key"]>(
    PLATFORMS[0].key,
  );
  const active = PLATFORMS.find((p) => p.key === activeKey)!;

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">
        Looking posts for:{" "}
        <span className="text-primary">{`{ ${SAAS_NAME} }`}</span>
      </h1>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Platform rail */}
        <nav className="flex shrink-0 gap-2 overflow-x-auto border border-border p-2 lg:w-56 lg:flex-col lg:overflow-visible">
          {PLATFORMS.map((platform) => {
            const isActive = platform.key === activeKey;
            return (
              <button
                key={platform.key}
                type="button"
                onClick={() => setActiveKey(platform.key)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex min-w-fit items-center gap-3 px-3 py-2.5 text-left transition-colors",
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
        <section className="min-w-0 flex-1 border border-border">
          <header className="flex items-center gap-3 border-b border-border px-4 py-3">
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
            </span>
          </header>

          <ul>
            {active.posts.map((post) => (
              <li
                key={post.id}
                className="group border-b border-border px-4 py-4 transition-colors last:border-b-0 hover:bg-sidebar-accent/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{post.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {post.community} · {post.author} · {post.time}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-foreground/70">
                      {post.snippet}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                        INTENT_STYLES[post.intent],
                      )}
                    >
                      {post.intent} intent
                    </span>
                    <button
                      type="button"
                      className="bg-primary px-3 py-1.5 text-xs font-bold tracking-wider text-primary-foreground uppercase opacity-0 transition-opacity group-hover:opacity-100 hover:bg-primary/90"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
