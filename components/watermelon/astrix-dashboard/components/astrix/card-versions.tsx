"use client";

import { useState } from "react";
import { FaHackerNews, FaRedditAlien } from "react-icons/fa6";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  Pencil,
  RotateCw,
  X as XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import "../../dashboard.css";

type Sample = {
  title: string;
  meta: string;
  reply: string;
  Icon: typeof FaRedditAlien;
  bg: string;
};

const SAMPLES: Sample[] = [
  {
    title: "Looking for a simple invoicing tool that is not enterprise priced",
    meta: "r/freelance · u/marta_builds · 4m ago",
    reply:
      "Been exactly here. The chasing was the part that ate my Fridays, so I ended up building Acme around it. No seat minimum, and honestly even a plain reminder script gets you most of the way.",
    Icon: FaRedditAlien,
    bg: "#FF4500",
  },
  {
    title: "Ask HN: how do you find your first hundred users?",
    meta: "Hacker News · tomasz · 26m ago",
    reply:
      "Answering questions in the places those users already complain worked better for us than any launch. Slow, but the people who come back actually stay.",
    Icon: FaHackerNews,
    bg: "#FF6600",
  },
];

function Meta({ s }: { s: Sample }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <s.Icon className="size-4 shrink-0" style={{ color: s.bg }} />
      <span className="truncate text-xs text-muted-foreground">{s.meta}</span>
    </div>
  );
}

function IconButton({
  Icon,
  label,
  tone = "muted",
}: {
  Icon: typeof Check;
  label: string;
  tone?: "muted" | "danger";
}) {
  return (
    <span
      aria-label={label}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center border border-border transition-colors",
        tone === "danger"
          ? "text-muted-foreground/40 hover:text-red-400"
          : "text-muted-foreground/40 hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
    </span>
  );
}

/* A — what ships today: the draft under a rule, copy on the block. */
function VariantA({ s }: { s: Sample }) {
  return (
    <li className="flex flex-col border border-border bg-card">
      <div className="px-4 pt-4">
        <Meta s={s} />
        <p className="mt-2 text-sm font-medium">{s.title}</p>
      </div>
      <div className="mx-4 mt-4 border-l-2 border-brand bg-sidebar-accent/30 py-2.5 pr-2.5 pl-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-brand text-[10px] font-bold tracking-wider uppercase">
            Your reply
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            <Copy className="size-3" /> Copy
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">
          {s.reply}
        </p>
      </div>
      <div className="mt-4 flex justify-end gap-2 border-t border-border px-4 py-3">
        <IconButton Icon={Check} label="Replied" />
        <IconButton Icon={XIcon} label="Skip" tone="danger" />
      </div>
    </li>
  );
}

/* B — copy is the card. One obvious thing to do. */
function VariantB({ s }: { s: Sample }) {
  return (
    <li className="flex flex-col border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <Meta s={s} />
        <p className="mt-1.5 truncate text-xs text-muted-foreground/70">
          {s.title}
        </p>
      </div>
      <p className="px-4 py-4 text-sm leading-relaxed text-foreground">
        {s.reply}
      </p>
      <div className="flex items-stretch gap-px bg-border">
        <button className="flex flex-1 cursor-pointer items-center justify-center gap-2 bg-card py-3 text-xs font-medium text-foreground transition-colors hover:bg-sidebar-accent">
          <Copy className="size-4" /> Copy and open
        </button>
        <button className="flex w-12 cursor-pointer items-center justify-center bg-card text-muted-foreground/50 transition-colors hover:text-foreground">
          <Check className="size-4" />
        </button>
        <button className="flex w-12 cursor-pointer items-center justify-center bg-card text-muted-foreground/50 transition-colors hover:text-red-400">
          <XIcon className="size-4" />
        </button>
      </div>
    </li>
  );
}

/* C — a thread. Reads the way it will read once posted. */
function VariantC({ s }: { s: Sample }) {
  return (
    <li className="flex flex-col border border-border bg-card p-4">
      <Meta s={s} />
      <p className="mt-2 text-sm font-medium">{s.title}</p>

      <div className="mt-3 flex gap-3">
        <span className="mt-1 w-px shrink-0 bg-border" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            You, replying
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">
            {s.reply}
          </p>
          <div className="mt-3 flex items-center gap-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            <span className="flex cursor-pointer items-center gap-1.5 hover:text-foreground">
              <Copy className="size-3" /> Copy
            </span>
            <span className="flex cursor-pointer items-center gap-1.5 hover:text-foreground">
              <Pencil className="size-3" /> Edit
            </span>
            <span className="flex cursor-pointer items-center gap-1.5 hover:text-foreground">
              <RotateCw className="size-3" /> Rewrite
            </span>
            <span className="ml-auto flex cursor-pointer items-center gap-1.5 hover:text-foreground">
              Open <ArrowUpRight className="size-3" />
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}

/* D — post and reply as two tabs. Shortest card of the five. */
function VariantD({ s }: { s: Sample }) {
  const [tab, setTab] = useState<"post" | "reply">("reply");
  return (
    <li className="flex flex-col border border-border bg-card">
      <div className="flex items-center justify-between gap-3 px-4 pt-3">
        <Meta s={s} />
        <div className="flex shrink-0">
          {(["post", "reply"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "cursor-pointer border-b-2 px-2 pb-1 text-[10px] font-bold tracking-wider uppercase transition-colors",
                tab === key
                  ? "border-brand text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[6.5rem] px-4 py-3">
        {tab === "post" ? (
          <p className="text-sm font-medium">{s.title}</p>
        ) : (
          <p className="text-sm leading-relaxed text-foreground/85">
            {s.reply}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
        <IconButton Icon={Copy} label="Copy" />
        <IconButton Icon={Check} label="Replied" />
        <IconButton Icon={XIcon} label="Skip" tone="danger" />
      </div>
    </li>
  );
}

/* E — reply folded away. Densest, one click to see it. */
function VariantE({ s }: { s: Sample }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="flex flex-col border border-border bg-card">
      <div className="px-4 pt-3 pb-2">
        <Meta s={s} />
        <p className="mt-1.5 text-sm font-medium">{s.title}</p>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2 border-t border-border px-4 py-2 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronDown className={cn("size-3.5 shrink-0", open && "rotate-180")} />
        <span className="truncate">
          {open ? "Reply ready" : s.reply}
        </span>
      </button>

      {open ? (
        <div className="px-4 pb-3">
          <p className="text-sm leading-relaxed text-foreground/85">
            {s.reply}
          </p>
          <div className="mt-3 flex justify-end gap-2">
            <IconButton Icon={Copy} label="Copy" />
            <IconButton Icon={Check} label="Replied" />
            <IconButton Icon={XIcon} label="Skip" tone="danger" />
          </div>
        </div>
      ) : null}
    </li>
  );
}

const VARIANTS = [
  {
    key: "A",
    name: "Draft under a rule",
    note: "What ships today. The reply is clearly yours, but it sits below the post and the card gets tall.",
    Render: VariantA,
  },
  {
    key: "B",
    name: "Copy is the card",
    note: "The reply is the content and the post shrinks to a caption. One wide Copy and open button, because that is the only thing you do here. My pick.",
    Render: VariantB,
  },
  {
    key: "C",
    name: "Thread",
    note: "Reply indented under the post like a real comment, with text actions instead of buttons. Reads the way it will read once posted.",
    Render: VariantC,
  },
  {
    key: "D",
    name: "Two tabs",
    note: "Post and reply share one slot, opening on the reply. Shortest card, so more fit on screen, but you cannot see both at once.",
    Render: VariantD,
  },
  {
    key: "E",
    name: "Folded away",
    note: "One line of the reply as a teaser, expand to read. Densest of the five, one extra click per post.",
    Render: VariantE,
  },
];

export default function CardVersions() {
  return (
    <div className="astrix-dashboard dark min-h-svh px-6 py-10">
      <header className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold">Post and reply cards</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Five ways to sit the drafted reply next to the post it answers. Tabs
          and folds are live, click them.
        </p>
      </header>

      <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-12">
        {VARIANTS.map(({ key, name, note, Render }) => (
          <section key={key}>
            <div className="flex items-baseline gap-3">
              <span className="bg-brand px-2 py-0.5 text-xs font-bold text-white">
                {key}
              </span>
              <h2 className="text-lg font-medium">{name}</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{note}</p>
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
