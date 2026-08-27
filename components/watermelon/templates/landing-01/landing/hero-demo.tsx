"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  Check,
  ChevronDown,
  Copy,
  Home,
  RefreshCw,
  Rocket,
  X,
} from "lucide-react";
import { FaDiscord } from "react-icons/fa6";
import {
  FaHackerNews,
  FaLinkedinIn,
  FaRedditAlien,
  FaXTwitter,
} from "react-icons/fa6";

const RAIL = [
  {
    label: "Reddit",
    Icon: FaRedditAlien,
    bg: "#FF4500",
    fg: "#ffffff",
    base: 412,
  },
  {
    label: "Hacker News",
    Icon: FaHackerNews,
    bg: "#FF6600",
    fg: "#ffffff",
    base: 96,
  },
  {
    label: "X / Twitter",
    Icon: FaXTwitter,
    bg: "#ffffff",
    fg: "#000000",
    base: 188,
  },
  {
    label: "LinkedIn",
    Icon: FaLinkedinIn,
    bg: "#0A66C2",
    fg: "#ffffff",
    base: 54,
  },
];

const FEED = [
  {
    id: "invoicing",
    meta: "r/freelance · u/marta_builds · just now",
    intent: "High",
    title: "Looking for a simple invoicing tool that is not enterprise priced",
    snippet:
      "Every option wants a sales call and a seat minimum. I bill six clients a month.",
    reply:
      "Ran into this exact thing last year. Happy to share how we handle the chasing part if that helps.",
    Icon: FaRedditAlien,
    color: "#FF4500",
  },
  {
    id: "latepayers",
    meta: "r/smallbusiness · u/deniz_k · just now",
    intent: "Medium",
    title: "How do you handle late payers without being rude about it",
    snippet:
      "Two clients are 30 days out and I hate sending the follow up email every week.",
    reply:
      "The tedious bit is doing it by hand. A reminder on a schedule fixed most of it for us.",
    Icon: FaRedditAlien,
    color: "#FF4500",
  },
  {
    id: "spreadsheets",
    meta: "LinkedIn · Priya S. · just now",
    intent: "High",
    title:
      "Our finance ops still run on three spreadsheets. Open to recommendations.",
    snippet:
      "Month end takes two days and something always slips through the cracks.",
    reply:
      "We were on four of them. Worth mapping which parts are actually repeat work first.",
    Icon: FaLinkedinIn,
    color: "#0A66C2",
  },
  {
    id: "notion-crm",
    meta: "Hacker News · tomasz · just now",
    intent: "Medium",
    title: "Has anyone run a CRM out of Notion long term?",
    snippet: "Curious how it holds up once you pass a few hundred contacts.",
    reply:
      "It held up to about 300 for us, then the manual upkeep got worse than the tool.",
    Icon: FaHackerNews,
    color: "#FF6600",
  },
];

const INTENT: Record<string, string> = {
  High: "bg-[#FF6600] text-[#101010]",
  Medium: "bg-[#FFC53D] text-[#101010]",
};

const SCORE_MS = 1100;

function Card({
  post,
  scored,
}: {
  post: (typeof FEED)[number];
  scored: boolean;
}) {
  return (
    <li className="flex flex-col border border-white/10 bg-white/[0.03]">
      <div className="flex items-center justify-between gap-3 bg-white/[0.04] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <post.Icon
            className="size-3.5 shrink-0"
            style={{ color: post.color }}
          />
          <span className="truncate text-[11px] text-white/40">
            {post.meta}
          </span>
        </div>
        {scored ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className={`shrink-0 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${INTENT[post.intent]}`}
          >
            {post.intent} intent
          </motion.span>
        ) : (
          <span className="shrink-0 font-mono text-[10px] tracking-wider text-white/25 uppercase">
            Scoring...
          </span>
        )}
      </div>

      <div className="flex-1 p-3.5">
        <p className="line-clamp-2 text-[13px] leading-snug font-medium text-white">
          {post.title}
        </p>
        <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-white/45">
          {post.snippet}
        </p>
        {/* Reserved either way, so nothing reflows when the draft appears. */}
        <div className="mt-2.5 h-[52px]">
          {scored ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="line-clamp-2 border border-white/10 bg-[#101010] p-2.5 text-[11px] leading-snug text-white/60"
            >
              {post.reply}
            </motion.p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-white/10 px-3.5 py-2.5">
        {[Copy, Check, X].map((Icon, i) => (
          <span
            key={i}
            className="flex h-7 w-7 items-center justify-center border border-white/10 text-white/25"
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        ))}
      </div>
    </li>
  );
}

const SIDEBAR = [
  { label: "Dashboard", Icon: Home, active: true },
  { label: "Analytics", Icon: BarChart3 },
];

export default function HeroDemo() {
  // Nothing moves: the cards stay put and get scored one after another, then
  // the pass starts over.
  const [scoredCount, setScoredCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setScoredCount((n) => (n > FEED.length ? 0 : n + 1));
    }, SCORE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-full w-full text-left">
      {/* Sidebar */}
      <aside className="hidden w-52 shrink-0 flex-col border-r border-white/10 md:flex">
        <div className="flex h-12 items-center gap-2 px-3">
          <span className="flex h-6 w-6 items-center justify-center bg-[#A3FF12] font-mono text-[10px] font-bold text-[#101010]">
            R
          </span>
          <span className="text-sm font-medium text-white">Replies</span>
        </div>

        <nav className="flex flex-col gap-1.5 px-3 py-2">
          {SIDEBAR.map((item) => (
            <span
              key={item.label}
              className={`flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-xs ${
                item.active ? "bg-white/[0.07] text-[#A3FF12]" : "text-white/40"
              }`}
            >
              <item.Icon className="size-4" />
              {item.label}
            </span>
          ))}
        </nav>

        <p className="px-5 pt-3 pb-1 font-mono text-[9px] tracking-widest text-white/25 uppercase">
          Launch
        </p>
        <nav className="flex flex-col gap-1.5 px-3">
          <span className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-xs text-white/40">
            <Rocket className="size-4" />
            Launch sites
          </span>
        </nav>

        <p className="px-5 pt-3 pb-1 font-mono text-[9px] tracking-widest text-white/25 uppercase">
          Community
        </p>
        <nav className="flex flex-col gap-1.5 px-3">
          <span className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-xs text-white/40">
            <FaDiscord className="size-4" />
            Discord
          </span>
        </nav>

        <div className="mt-auto flex items-center gap-2 border-t border-white/10 px-3 py-3">
          <span className="h-7 w-7 shrink-0 rounded-full bg-white/10" />
          <span className="min-w-0">
            <span className="block truncate text-xs text-white/70">You</span>
            <span className="block truncate text-[10px] text-white/30">
              Pro plan
            </span>
          </span>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-white/10 px-3">
          <span className="flex items-center gap-2 border border-white/10 px-2.5 py-1.5">
            <span className="flex h-4 w-4 items-center justify-center bg-[#A3FF12] font-mono text-[8px] font-bold text-[#101010]">
              A
            </span>
            <span className="text-[11px] text-white">Acme</span>
            <ChevronDown className="size-3 text-white/30" />
          </span>
          <span className="ml-auto font-mono text-[10px] tracking-widest text-white/30 tabular-nums uppercase">
            750 posts · 41 high intent
          </span>
        </div>

        {/* Filter row */}
        <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2">
          {["All", "High", "Medium", "Low"].map((label, i) => (
            <span
              key={label}
              className={`px-2.5 py-1 font-mono text-[9px] font-bold tracking-widest uppercase ${
                i === 0
                  ? "bg-white/10 text-white"
                  : "border border-white/10 text-white/35"
              }`}
            >
              {label}
            </span>
          ))}
          <span className="flex h-6 w-6 items-center justify-center border border-white/10 text-white/30">
            <RefreshCw className="size-3" />
          </span>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Platform rail */}
          <div className="hidden w-40 shrink-0 flex-col border-r border-white/10 lg:flex">
            {RAIL.map((item, i) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-3 py-2.5 ${i === 0 ? "bg-white/[0.06]" : ""}`}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center"
                  style={{ backgroundColor: item.bg }}
                >
                  <item.Icon className="h-3 w-3" style={{ color: item.fg }} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[11px] font-medium text-white">
                    {item.label}
                  </span>
                  <span className="font-mono text-[9px] text-white/30 tabular-nums">
                    {item.base} posts
                  </span>
                </span>
              </div>
            ))}
          </div>

          {/* Feed */}
          <ul className="grid min-w-0 flex-1 auto-rows-fr grid-cols-1 content-start gap-2.5 overflow-hidden p-2.5 xl:grid-cols-2">
            {FEED.map((post, i) => (
              <Card key={post.id} post={post} scored={i < scoredCount} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
