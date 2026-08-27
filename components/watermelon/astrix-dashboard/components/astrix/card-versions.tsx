"use client";

import { FaRedditAlien, FaHackerNews, FaXTwitter } from "react-icons/fa6";
import { ArrowUpRight, Check, Copy, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import "../../dashboard.css";

type Sample = {
  title: string;
  meta: string;
  snippet: string;
  reply: string;
  why: string;
  intent: "high" | "medium";
  platform: string;
  Icon: typeof FaRedditAlien;
  bg: string;
};

const SAMPLES: Sample[] = [
  {
    title: "Looking for a simple invoicing tool that is not enterprise priced",
    meta: "r/freelance · u/marta_builds · 4m ago",
    snippet:
      "Every option I try wants a sales call and a seat minimum. I bill maybe six clients a month and I just want something that sends a PDF and chases the payment.",
    reply:
      "Ran into this exact thing last year. We ended up building Acme around it — happy to share how we handle the chasing part if that helps.",
    why: "Asking for a tool like yours, and priced out of the alternatives.",
    intent: "high",
    platform: "Reddit",
    Icon: FaRedditAlien,
    bg: "#FF4500",
  },
  {
    title: "Show HN: I automated my invoice follow-ups with a cron job",
    meta: "Hacker News · tomasz · 26m ago",
    snippet:
      "It is 80 lines of Python and it has recovered about 4k in late payments. Curious what everyone else uses for this.",
    reply:
      "Worth checking how much of this is repeat work — that was 80% of ours. We wrote Acme for the repeat part and kept the judgement calls manual.",
    why: "Building the thing you sell, and explicitly asking what others use.",
    intent: "medium",
    platform: "Hacker News",
    Icon: FaHackerNews,
    bg: "#FF6600",
  },
];

const INTENT_STYLES: Record<string, string> = {
  high: "bg-[#FF6600] text-[#101010]",
  medium: "bg-[#FFC53D] text-[#101010]",
};

function IntentBadge({ intent }: { intent: string }) {
  return (
    <span
      className={cn(
        "shrink-0 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase",
        INTENT_STYLES[intent],
      )}
    >
      {intent} intent
    </span>
  );
}

function Actions({ stacked = false }: { stacked?: boolean }) {
  return (
    <div className={cn("flex shrink-0 items-start gap-2", stacked && "flex-col")}>
      <CopyButton />
      <button
        type="button"
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border border-border text-muted-foreground/40 transition-colors hover:border-foreground/40 hover:text-foreground"
      >
        <Check className="h-5 w-5" />
      </button>
      <button
        type="button"
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border border-border text-muted-foreground/40 transition-colors hover:border-red-500/40 hover:text-red-400"
      >
        <XIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

function CopyButton() {
  return (
    <button
      type="button"
      aria-label="Copy reply"
      className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border border-border text-muted-foreground/40 transition-colors hover:border-foreground/40 hover:text-foreground"
    >
      <Copy className="h-5 w-5" />
    </button>
  );
}

/* A — what is live now: flat card, reply under a rule. */
function VariantA({ s }: { s: Sample }) {
  return (
    <li className="border border-border bg-card p-4 transition-colors hover:border-foreground/25">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-medium">{s.title}</p>
            <IntentBadge intent={s.intent} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{s.meta}</p>
          <p className="mt-2 line-clamp-2 text-sm text-foreground/70">
            {s.snippet}
          </p>
        </div>
        <Actions />
      </div>
      <div className="mt-4 border-t border-border pt-3">
        <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          Reply
        </p>
        <p className="mt-2 text-sm text-foreground/75">{s.reply}</p>
      </div>
    </li>
  );
}

/* B — platform colour as a spine, reply quoted off a lime rule. */
function VariantB({ s }: { s: Sample }) {
  return (
    <li className="flex border border-border bg-card transition-colors hover:border-foreground/25">
      <span className="w-1 shrink-0" style={{ backgroundColor: s.bg }} />
      <div className="min-w-0 flex-1 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <s.Icon className="size-3.5" style={{ color: s.bg }} />
              <span>{s.meta}</span>
            </div>
            <p className="mt-1.5 text-sm font-medium">{s.title}</p>
            <p className="mt-2 line-clamp-2 text-sm text-foreground/70">
              {s.snippet}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <IntentBadge intent={s.intent} />
            <Actions />
          </div>
        </div>
        <div className="mt-4 border-l-2 border-primary pl-3">
          <p className="text-[10px] font-bold tracking-wider text-primary uppercase">
            Your reply
          </p>
          <p className="mt-1.5 text-sm text-foreground/75">{s.reply}</p>
        </div>
      </div>
    </li>
  );
}

/* C — post and draft side by side, so the pairing reads at a glance. */
function VariantC({ s }: { s: Sample }) {
  return (
    <li className="border border-border bg-card transition-colors hover:border-foreground/25">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center"
            style={{ backgroundColor: s.bg }}
          >
            <s.Icon className="size-3 text-white" />
          </span>
          <span className="truncate text-xs text-muted-foreground">{s.meta}</span>
        </div>
        <IntentBadge intent={s.intent} />
      </div>
      <div className="grid gap-0 md:grid-cols-2">
        <div className="min-w-0 p-4">
          <p className="text-sm font-medium">{s.title}</p>
          <p className="mt-2 line-clamp-3 text-sm text-foreground/70">
            {s.snippet}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
            Open on {s.platform} <ArrowUpRight className="size-3" />
          </span>
        </div>
        <div className="min-w-0 border-t border-border bg-sidebar-accent/20 p-4 md:border-t-0 md:border-l">
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Draft reply
          </p>
          <p className="mt-2 text-sm text-foreground/75">{s.reply}</p>
          <div className="mt-3 flex gap-2">
            <Actions />
          </div>
        </div>
      </div>
    </li>
  );
}

/* D — header strip, body, footer bar. Most structured, most chrome. */
function VariantD({ s }: { s: Sample }) {
  return (
    <li className="border border-border bg-card transition-colors hover:border-foreground/25">
      <div className="flex items-center justify-between gap-3 bg-sidebar-accent/40 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <s.Icon className="size-4 shrink-0" style={{ color: s.bg }} />
          <span className="truncate text-xs font-medium">{s.platform}</span>
          <span className="truncate text-xs text-muted-foreground">{s.meta}</span>
        </div>
        <IntentBadge intent={s.intent} />
      </div>
      <div className="p-4">
        <p className="text-sm font-medium">{s.title}</p>
        <p className="mt-2 line-clamp-2 text-sm text-foreground/70">
          {s.snippet}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Why: {s.why}</p>
        <p className="mt-4 border border-border bg-background p-3 text-sm text-foreground/75">
          {s.reply}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5">
        <CopyButton />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-8 cursor-pointer border border-border px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:text-red-400"
          >
            Skip
          </button>
          <button
            type="button"
            className="flex h-8 cursor-pointer items-center gap-1.5 border border-primary bg-primary px-3 text-[10px] font-bold tracking-wider text-primary-foreground uppercase"
          >
            <Check className="size-3" /> Replied
          </button>
        </div>
      </div>
    </li>
  );
}

/* E — draft first, post demoted to a citation. Treats this as a writing tool. */
function VariantE({ s }: { s: Sample }) {
  return (
    <li className="border border-border bg-card p-4 transition-colors hover:border-foreground/25">
      <div className="flex items-start gap-3 border-l-2 border-border pl-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <s.Icon className="size-3.5 shrink-0" style={{ color: s.bg }} />
            <p className="truncate text-xs font-medium text-muted-foreground">
              {s.title}
            </p>
          </div>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/70">
            {s.snippet}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm text-foreground">{s.reply}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <IntentBadge intent={s.intent} />
          <span className="text-xs text-muted-foreground">{s.meta}</span>
        </div>
        <Actions />
      </div>
    </li>
  );
}

/* F — dense list, draft folded away behind a native disclosure. */
function VariantF({ s }: { s: Sample }) {
  return (
    <li className="border border-border bg-card">
      <div className="flex items-start gap-3 p-3">
        <span
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center"
          style={{ backgroundColor: s.bg }}
        >
          <s.Icon className="size-3.5 text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-medium">{s.title}</p>
            <IntentBadge intent={s.intent} />
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {s.meta}
          </p>
        </div>
        <Actions />
      </div>
      <details className="group border-t border-border">
        <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase hover:text-foreground">
          Draft ready
          <span className="text-muted-foreground group-open:hidden">Show</span>
          <span className="hidden text-muted-foreground group-open:inline">
            Hide
          </span>
        </summary>
        <div className="px-3 pb-3">
          <p className="text-sm text-foreground/75">{s.reply}</p>
        </div>
      </details>
    </li>
  );
}

const VARIANTS = [
  {
    key: "A",
    name: "Flat card (current)",
    note: "Everything stacked, reply under a rule. Cheapest to scan, but the post and the draft read as one block of text.",
    Render: VariantA,
  },
  {
    key: "B",
    name: "Platform spine",
    note: "Colour bar tells you the source before you read anything, and the lime rule marks the draft as yours, not theirs. My pick.",
    Render: VariantB,
  },
  {
    key: "C",
    name: "Side by side",
    note: "Post left, draft right. Reads best on wide screens and makes the pairing obvious. Wasteful in a two-column grid.",
    Render: VariantC,
  },
  {
    key: "D",
    name: "Header and footer bars",
    note: "Most structured: source strip on top, actions on a footer bar. Clear, but heavy once ten of them stack up.",
    Render: VariantD,
  },
  {
    key: "E",
    name: "Draft first",
    note: "Treats this as a writing tool: the draft is the content, the post is a citation. Good if replying is the main job.",
    Render: VariantE,
  },
  {
    key: "F",
    name: "Dense with disclosure",
    note: "Back to a tight list, draft folded away until you want it. Most posts per screen, one extra click per reply.",
    Render: VariantF,
  },
];

export default function CardVersions() {
  return (
    <div className="astrix-dashboard dark min-h-svh px-6 py-10">
      <header className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold">Post card designs</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Six takes on the feed card, same data in each. They differ on one
          question: is this a list you triage, or a queue of replies you send.
        </p>
      </header>

      <div className="mx-auto mt-10 flex max-w-5xl flex-col gap-12">
        {VARIANTS.map(({ key, name, note, Render }) => (
          <section key={key}>
            <div className="flex items-baseline gap-3">
              <span className="bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                {key}
              </span>
              <h2 className="text-lg font-medium">{name}</h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{note}</p>
            <ul className="mt-4 flex flex-col gap-3">
              {SAMPLES.map((sample) => (
                <Render key={sample.title} s={sample} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
