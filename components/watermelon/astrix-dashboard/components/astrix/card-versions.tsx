"use client";

import { FaHackerNews, FaRedditAlien } from "react-icons/fa6";
import { ArrowUpRight, Check, Copy, Sparkles, X as XIcon } from "lucide-react";
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
      "Been exactly here. The chasing was the part that ate my Fridays, so I ended up building Acme around it. It sends the invoice then follows up on a schedule so you are not the one nagging. No seat minimum. Honestly even a plain reminder script gets you most of the way.",
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
      "The 80 line version held up for us to about 300 invoices, then retries and timezone edge cases turned it into a real project. That was the point we pulled it out into Acme. If yours is recovering 4k already the maths is probably on your side either way.",
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

function SquareButton({
  Icon,
  tone = "muted",
}: {
  Icon: typeof Check;
  tone?: "muted" | "primary" | "danger";
}) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center border",
        tone === "primary"
          ? "border-primary bg-primary text-primary-foreground"
          : tone === "danger"
            ? "border-border text-muted-foreground/40"
            : "border-border text-muted-foreground/40",
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

/* G — the reply is the card. The post is the quote it answers. */
function VariantG({ s }: { s: Sample }) {
  return (
    <li className="border border-border bg-card">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <s.Icon className="mt-0.5 size-4 shrink-0" style={{ color: s.bg }} />
          <div className="min-w-0">
            <p className="truncate text-sm text-foreground/80">{s.title}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {s.meta}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <IntentBadge intent={s.intent} />
          <span className="flex h-7 items-center gap-1 border border-border px-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Open <ArrowUpRight className="size-3" />
          </span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm leading-relaxed text-foreground">{s.reply}</p>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5">
        <p className="truncate text-xs text-muted-foreground">Why: {s.why}</p>
        <div className="flex shrink-0 items-center gap-2">
          <SquareButton Icon={Copy} />
          <SquareButton Icon={Check} tone="primary" />
          <SquareButton Icon={XIcon} tone="danger" />
        </div>
      </div>
    </li>
  );
}

/* H — a thread. Their post, your reply nested under it. */
function VariantH({ s }: { s: Sample }) {
  return (
    <li className="border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center"
            style={{ backgroundColor: s.bg }}
          >
            <s.Icon className="size-3.5 text-white" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium">{s.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.meta}</p>
            <p className="mt-2 line-clamp-2 text-sm text-foreground/60">
              {s.snippet}
            </p>
          </div>
        </div>
        <IntentBadge intent={s.intent} />
      </div>

      <div className="mt-4 ml-3.5 border-l border-border pl-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">You, replying</p>
          <div className="flex items-center gap-2">
            <SquareButton Icon={Copy} />
            <SquareButton Icon={Check} tone="primary" />
            <SquareButton Icon={XIcon} tone="danger" />
          </div>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground/85">
          {s.reply}
        </p>
      </div>
    </li>
  );
}

/* I — two panes. Post left, reply right, they never fight for space. */
function VariantI({ s }: { s: Sample }) {
  return (
    <li className="grid border border-border bg-card md:grid-cols-2">
      <div className="min-w-0 p-4">
        <div className="flex items-center gap-2">
          <s.Icon className="size-3.5 shrink-0" style={{ color: s.bg }} />
          <span className="truncate text-xs text-muted-foreground">
            {s.meta}
          </span>
          <IntentBadge intent={s.intent} />
        </div>
        <p className="mt-2 text-sm font-medium">{s.title}</p>
        <p className="mt-2 line-clamp-3 text-sm text-foreground/60">
          {s.snippet}
        </p>
      </div>
      <div className="min-w-0 border-t border-border bg-sidebar-accent/20 p-4 md:border-t-0 md:border-l">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Your reply
          </p>
          <div className="flex items-center gap-2">
            <SquareButton Icon={Copy} />
            <SquareButton Icon={Check} tone="primary" />
            <SquareButton Icon={XIcon} tone="danger" />
          </div>
        </div>
        <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-foreground/85">
          {s.reply}
        </p>
      </div>
    </li>
  );
}

/* J — write-it-yourself. The reply sits in a box you can edit. */
function VariantJ({ s }: { s: Sample }) {
  return (
    <li className="border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{s.title}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <s.Icon className="size-3" style={{ color: s.bg }} />
            {s.meta}
          </p>
        </div>
        <IntentBadge intent={s.intent} />
      </div>

      <div className="mt-3 border border-border bg-background">
        <p className="p-3 text-sm leading-relaxed text-foreground/85">
          {s.reply}
        </p>
        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
          <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            <Sparkles className="size-3" />
            Rewrite
          </span>
          <div className="flex items-center gap-2">
            <SquareButton Icon={Copy} />
            <SquareButton Icon={Check} tone="primary" />
            <SquareButton Icon={XIcon} tone="danger" />
          </div>
        </div>
      </div>
    </li>
  );
}

/* K — dense until you want it. Post is one line, reply expands. */
function VariantK({ s }: { s: Sample }) {
  return (
    <li className="border border-border bg-card">
      <details open>
        <summary className="flex cursor-pointer list-none items-center gap-3 p-3">
          <s.Icon className="size-4 shrink-0" style={{ color: s.bg }} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {s.title}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {s.meta}
            </span>
          </span>
          <IntentBadge intent={s.intent} />
        </summary>
        <div className="border-t border-border p-3">
          <p className="text-sm leading-relaxed text-foreground/85">
            {s.reply}
          </p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <SquareButton Icon={Copy} />
            <SquareButton Icon={Check} tone="primary" />
            <SquareButton Icon={XIcon} tone="danger" />
          </div>
        </div>
      </details>
    </li>
  );
}

const VARIANTS = [
  {
    key: "G",
    name: "Reply first",
    note: "The written reply is the card. The post shrinks to one line at the top, the verdict moves to the footer. My pick: the reply is the thing you act on.",
    Render: VariantG,
  },
  {
    key: "H",
    name: "Thread",
    note: "Their post, then your reply indented under it like a real comment thread. Reads the way it will read once posted.",
    Render: VariantH,
  },
  {
    key: "I",
    name: "Two panes",
    note: "Post left, reply right. Neither squeezes the other, but it wants full width so it fights the two column grid.",
    Render: VariantI,
  },
  {
    key: "J",
    name: "Composer",
    note: "The reply sits in a box that looks editable, with a rewrite control. Right if you expect to tweak most drafts before posting.",
    Render: VariantJ,
  },
  {
    key: "K",
    name: "Collapsible",
    note: "One line per post, reply folded out when you want it. Most posts per screen, one click per reply.",
    Render: VariantK,
  },
];

export default function CardVersions() {
  return (
    <div className="astrix-dashboard dark min-h-svh px-6 py-10">
      <header className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">Post and reply designs</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Five ways to show a post next to the reply we wrote for it. Same two
          posts in each, with real drafted replies.
        </p>
      </header>

      <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-12">
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
