"use client";

import { useState } from "react";
import { Check, ExternalLink, Link2, X } from "lucide-react";
import { FaHackerNews, FaRedditAlien, FaXTwitter } from "react-icons/fa6";
import { cn } from "@/lib/utils";

type Lead = {
  id: string;
  platform: "reddit" | "hn" | "x";
  community: string;
  time: string;
  title: string;
  body: string;
  score: number;
  type: string;
  why: string;
  angle: string;
};

const PLATFORM_META = {
  reddit: { Icon: FaRedditAlien, bg: "#FF4500", fg: "#ffffff", label: "Reddit" },
  hn: { Icon: FaHackerNews, bg: "#FF6600", fg: "#ffffff", label: "HN" },
  x: { Icon: FaXTwitter, bg: "#ffffff", fg: "#000000", label: "X" },
} as const;

const LEADS: Lead[] = [
  {
    id: "1",
    platform: "reddit",
    community: "r/smallbusiness",
    time: "12m ago",
    title: "Spent my whole Sunday copy-pasting invoices into a spreadsheet",
    body: "We're 4 people and every month I lose a day rebuilding the same sheet. There has to be a better way to do this that isn't a 40 dollar per seat enterprise thing.",
    score: 94,
    type: "Pain",
    why: "Describes the exact manual workflow your product replaces, and rules out expensive competitors.",
    angle: "Lead with the Sunday detail, mention you built this after the same problem. No pitch in the first line.",
  },
  {
    id: "2",
    platform: "hn",
    community: "Show HN",
    time: "38m ago",
    title: "Show HN: I built a small invoicing tool for freelancers",
    body: "Been working on this for 4 months on weekends. Handles recurring invoices and reminders. Would love feedback on the pricing page.",
    score: 81,
    type: "Adjacency",
    why: "Author builds in your space. Peer reply, not a sales pitch — good for credibility and backlinks.",
    angle: "Give real feedback on their pricing page first, mention yours as a builder-to-builder aside.",
  },
  {
    id: "3",
    platform: "reddit",
    community: "r/SaaS",
    time: "1h ago",
    title: "Hubspot just raised our seats to $800/mo, looking at alternatives",
    body: "Team of 6. We use maybe 10 percent of what we pay for. What are people moving to that isn't a toy?",
    score: 89,
    type: "Competitor",
    why: "Explicit competitor churn with budget stated and team size in your target range.",
    angle: "Compare on the 10 percent they actually use. Offer a migration export.",
  },
  {
    id: "4",
    platform: "x",
    community: "@marcusbuilds",
    time: "2h ago",
    title: "anyone know a CRM that doesn't need a full time admin to run it",
    body: "genuinely asking. every one I try wants me to configure 40 fields before I can log a call.",
    score: 76,
    type: "Solicitation",
    why: "Direct ask matching your positioning line almost word for word.",
    angle: "Reply with the setup time, not the feature list.",
  },
  {
    id: "5",
    platform: "reddit",
    community: "r/freelance",
    time: "3h ago",
    title: "How do you all track which clients still owe you money?",
    body: "Currently a notes app and vibes. It is going badly.",
    score: 68,
    type: "Pain",
    why: "Adjacent problem your product solves, though the author may be too small to pay.",
    angle: "Answer the question honestly first; link only if someone asks what you use.",
  },
];

const IDEAS = [
  { id: "ranked", label: "A · Ranked inbox" },
  { id: "focus", label: "B · Focus queue" },
  { id: "split", label: "C · Split view" },
] as const;

export function IdeasContent() {
  const [idea, setIdea] = useState<(typeof IDEAS)[number]["id"]>("ranked");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Feed layout ideas</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Three alternatives to the platform rail. All use the same mock leads so
          you can compare how each one reads. Static mockups, nothing is wired.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {IDEAS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setIdea(option.id)}
            className={cn(
              "h-9 cursor-pointer border px-4 text-xs font-bold tracking-wider uppercase transition-colors",
              idea === option.id
                ? "border-primary/40 bg-sidebar-accent/40 text-foreground"
                : "border-border text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {idea === "ranked" ? <RankedInbox /> : null}
      {idea === "focus" ? <FocusQueue /> : null}
      {idea === "split" ? <SplitView /> : null}

      <Notes idea={idea} />
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const hot = score >= 85;
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center border text-sm font-bold",
        hot
          ? "border-primary bg-primary text-[#101010]"
          : "border-border text-muted-foreground",
      )}
    >
      {score}
    </span>
  );
}

function PlatformMark({ platform }: { platform: Lead["platform"] }) {
  const meta = PLATFORM_META[platform];
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center"
      style={{ backgroundColor: meta.bg }}
    >
      <meta.Icon className="h-3 w-3" style={{ color: meta.fg }} />
    </span>
  );
}

/* A — one merged feed ranked by intent, platform demoted to a filter. */
function RankedInbox() {
  return (
    <div className="flex flex-col border border-border">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
          Best opportunities
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          {["All", "Reddit", "HN", "X", "High intent"].map((chip, i) => (
            <span
              key={chip}
              className={cn(
                "border px-3 py-1 text-xs",
                i === 0
                  ? "border-primary/40 bg-sidebar-accent/40 text-foreground"
                  : "border-border text-muted-foreground",
              )}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-border">
        {LEADS.map((lead) => (
          <li key={lead.id} className="flex gap-4 px-4 py-4 hover:bg-sidebar-accent/40">
            <ScoreBadge score={lead.score} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <PlatformMark platform={lead.platform} />
                <span className="text-xs text-muted-foreground">
                  {lead.community} · {lead.time}
                </span>
                <span className="border border-border px-2 py-0.5 text-[10px] tracking-wider text-muted-foreground uppercase">
                  {lead.type}
                </span>
              </div>
              <p className="mt-2 font-medium">{lead.title}</p>
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                {lead.body}
              </p>
              <p className="mt-2 text-xs text-primary">Why: {lead.why}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <button className="flex h-8 cursor-pointer items-center gap-2 border border-border px-3 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground">
                <ExternalLink className="size-3.5" />
                Reply
              </button>
              <button className="flex h-8 cursor-pointer items-center gap-2 border border-border px-3 text-xs text-muted-foreground hover:border-red-500/40 hover:text-red-400">
                <X className="size-3.5" />
                Skip
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* B — one lead at a time, triaged like an inbox. */
function FocusQueue() {
  const lead = LEADS[0];
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="flex flex-1 flex-col border border-border">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <PlatformMark platform={lead.platform} />
          <span className="text-xs text-muted-foreground">
            {lead.community} · {lead.time}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">1 of 42</span>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start gap-3">
            <ScoreBadge score={lead.score} />
            <div>
              <h2 className="text-lg font-semibold">{lead.title}</h2>
              <span className="mt-1 inline-block border border-border px-2 py-0.5 text-[10px] tracking-wider text-muted-foreground uppercase">
                {lead.type}
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{lead.body}</p>

          <div className="border border-border p-4">
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Why this matched
            </p>
            <p className="mt-2 text-sm">{lead.why}</p>
          </div>

          <div className="border border-primary/40 bg-sidebar-accent/30 p-4">
            <p className="text-[10px] font-bold tracking-wider text-primary uppercase">
              Suggested angle
            </p>
            <p className="mt-2 text-sm">{lead.angle}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="flex h-10 cursor-pointer items-center gap-2 bg-primary px-5 text-xs font-bold tracking-wider text-[#101010] uppercase">
              <ExternalLink className="size-4" />
              Open and reply
            </button>
            <button className="flex h-10 cursor-pointer items-center gap-2 border border-border px-5 text-xs font-bold tracking-wider text-muted-foreground uppercase hover:bg-sidebar-accent hover:text-foreground">
              <Check className="size-4" />
              Mark replied
            </button>
            <button className="flex h-10 cursor-pointer items-center gap-2 border border-border px-5 text-xs font-bold tracking-wider text-muted-foreground uppercase hover:border-red-500/40 hover:text-red-400">
              <X className="size-4" />
              Skip
            </button>
          </div>
        </div>
      </div>

      <div className="w-full shrink-0 border border-border lg:w-72">
        <p className="border-b border-border px-4 py-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          Up next
        </p>
        <ul className="divide-y divide-border">
          {LEADS.slice(1).map((next) => (
            <li key={next.id} className="flex items-start gap-3 px-4 py-3">
              <span className="text-sm font-bold text-muted-foreground">
                {next.score}
              </span>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm">{next.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {next.community}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* C — list on the left, everything about one lead on the right. */
function SplitView() {
  const [selected, setSelected] = useState(LEADS[0].id);
  const lead = LEADS.find((l) => l.id === selected)!;

  return (
    <div className="flex min-h-[32rem] flex-col border border-border lg:flex-row">
      <ul className="w-full shrink-0 divide-y divide-border border-b border-border lg:w-80 lg:border-r lg:border-b-0">
        {LEADS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setSelected(item.id)}
              className={cn(
                "flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors",
                item.id === selected
                  ? "bg-sidebar-accent"
                  : "hover:bg-sidebar-accent/50",
              )}
            >
              <span
                className={cn(
                  "text-sm font-bold",
                  item.score >= 85 ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.score}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <PlatformMark platform={item.platform} />
                  <span className="truncate text-xs text-muted-foreground">
                    {item.community} · {item.time}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm">{item.title}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <PlatformMark platform={lead.platform} />
          <span className="text-xs text-muted-foreground">
            {lead.community} · {lead.time}
          </span>
          <span className="ml-auto border border-border px-2 py-0.5 text-[10px] tracking-wider text-muted-foreground uppercase">
            {lead.type} · {lead.score}
          </span>
        </div>

        <h2 className="text-lg font-semibold">{lead.title}</h2>
        <p className="text-sm text-muted-foreground">{lead.body}</p>

        <div className="border border-border p-4">
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Why this matched
          </p>
          <p className="mt-2 text-sm">{lead.why}</p>
        </div>

        <div className="border border-border p-4">
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Draft reply
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{lead.angle}</p>
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          <button className="flex h-10 cursor-pointer items-center gap-2 bg-primary px-5 text-xs font-bold tracking-wider text-[#101010] uppercase">
            <ExternalLink className="size-4" />
            Open post
          </button>
          <button className="flex h-10 cursor-pointer items-center gap-2 border border-border px-5 text-xs font-bold tracking-wider text-muted-foreground uppercase hover:bg-sidebar-accent hover:text-foreground">
            <Link2 className="size-4" />
            Copy tracked link
          </button>
          <button className="flex h-10 cursor-pointer items-center gap-2 border border-border px-5 text-xs font-bold tracking-wider text-muted-foreground uppercase hover:bg-sidebar-accent hover:text-foreground">
            <Check className="size-4" />
            Mark replied
          </button>
        </div>
      </div>
    </div>
  );
}

const NOTES: Record<string, { good: string[]; bad: string[] }> = {
  ranked: {
    good: [
      "Highest intent is always on top, whatever platform it came from.",
      "Platform becomes a filter instead of a tab you have to visit.",
      "Scales to 9 platforms without 9 tabs.",
    ],
    bad: [
      "Needs the scorer working before it means anything.",
      "Dense; harder to scan on a laptop screen.",
    ],
  },
  focus: {
    good: [
      "One decision at a time, so the reply angle actually gets read.",
      "Skip is a first-class action, which trains the feed.",
      "Best fit for a daily 10-minute habit.",
    ],
    bad: [
      "Slow if you just want to skim what came in.",
      "Hides volume, so it feels emptier than it is.",
    ],
  },
  split: {
    good: [
      "Skim and read in one screen, familiar email pattern.",
      "Room for the draft reply and the tracked link without a modal.",
    ],
    bad: [
      "Wastes space on narrow screens.",
      "Two panes compete for attention.",
    ],
  },
};

function Notes({ idea }: { idea: string }) {
  const note = NOTES[idea];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="border border-border p-4">
        <p className="text-[10px] font-bold tracking-wider text-primary uppercase">
          Works
        </p>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
          {note.good.map((line) => (
            <li key={line}>— {line}</li>
          ))}
        </ul>
      </div>
      <div className="border border-border p-4">
        <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          Costs
        </p>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
          {note.bad.map((line) => (
            <li key={line}>— {line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
