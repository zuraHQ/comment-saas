"use client";

import {
  FaBluesky,
  FaGithub,
  FaHackerNews,
  FaRedditAlien,
  FaRegLightbulb,
  FaXTwitter,
} from "react-icons/fa6";
import { Check, Copy, X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const STEPS = [
  {
    n: "01",
    title: "We read eight platforms end to end",
    body: "Whole communities, not keyword hits, so the post that never says your product name still reaches you.",
  },
  {
    n: "02",
    title: "We rank them",
    body: "Every post is scored against what your product actually does. The rest never reaches your feed.",
  },
  {
    n: "03",
    title: "The reply is already written",
    body: "A draft in your voice, mentioning your product once, where it answers the question.",
  },
  {
    n: "04",
    title: "You get customers",
    body: "Every reply carries a tracked link, so clicks come back tagged with the platform they came from.",
  },
];

/* ---------------- previews ---------------- */

function Frame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border border-border bg-background p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

const RAIL = [
  { label: "Hacker News", Icon: FaHackerNews, bg: "#FF6600", n: "96 posts" },
  { label: "Reddit", Icon: FaRedditAlien, bg: "#FF4500", n: "412 posts" },
  { label: "Indie Hackers", Icon: FaRegLightbulb, bg: "#0E2439", n: "38 posts" },
  { label: "Bluesky", Icon: FaBluesky, bg: "#0085FF", n: "74 posts" },
  { label: "GitHub", Icon: FaGithub, bg: "#171717", n: "21 posts" },
  { label: "X / Twitter", Icon: FaXTwitter, bg: "#171717", n: "188 posts" },
];

export function PreviewRead() {
  return (
    <Frame>
      <div className="flex flex-col">
        {RAIL.map((r, i) => (
          <div
            key={r.label}
            className={cn(
              "flex items-center gap-3 rounded-md px-2 py-2.5",
              i === 0 && "bg-muted",
            )}
          >
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: r.bg }}
            >
              <r.Icon className="size-3.5 text-white" />
            </span>
            <span className="text-sm font-medium text-foreground">
              {r.label}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">{r.n}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function PreviewRank() {
  const rows = [
    { t: "Looking for a simple invoicing tool", s: 94, keep: true },
    { t: "How do you handle late payers", s: 81, keep: true },
    { t: "Has anyone run a CRM out of Notion", s: 57, keep: true },
    { t: "just launched v2 today, thanks all", s: 12, keep: false },
    { t: "weekly self promo thread", s: 8, keep: false },
  ];
  return (
    <Frame>
      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <div key={r.t} className={cn("flex items-center gap-3", !r.keep && "opacity-35")}>
            <span className="w-52 truncate text-sm text-foreground/80">{r.t}</span>
            <span className="h-1.5 flex-1 rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-neutral-900"
                style={{ width: `${r.s}%` }}
              />
            </span>
            <span className="w-7 text-right text-xs tabular-nums text-muted-foreground">
              {r.s}
            </span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

const DRAFT =
  "Been exactly here. The chasing was the part that ate my Fridays, so I ended up building Acme around it. No seat minimum.";

export function PreviewReply() {
  // Type the draft out, hold it, then start over.
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (typed >= DRAFT.length) {
      const restart = setTimeout(() => setTyped(0), 2600);
      return () => clearTimeout(restart);
    }
    const tick = setTimeout(() => setTyped((n) => n + 1), 22);
    return () => clearTimeout(tick);
  }, [typed]);

  const writing = typed < DRAFT.length;

  return (
    <Frame>
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <FaRedditAlien className="size-3.5 text-[#FF4500]" />
        r/freelance · u/marta_builds · 4m ago
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">
        Looking for a simple invoicing tool that is not enterprise priced
      </p>
      <div className="mt-3 flex gap-3">
        <span className="mt-1 w-px shrink-0 bg-muted" />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            {writing ? (
              <>
                AI drafting
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      className="size-1 rounded-full bg-neutral-400"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{
                        duration: 0.9,
                        repeat: Infinity,
                        delay: dot * 0.15,
                      }}
                    />
                  ))}
                </span>
              </>
            ) : (
              "Your reply"
            )}
          </p>
          <p className="mt-1.5 min-h-[4.5rem] text-sm leading-relaxed text-foreground/80">
            {DRAFT.slice(0, typed)}
            {writing ? (
              <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-neutral-400" />
            ) : null}
          </p>
        </div>
      </div>
      <div className="-mx-4 -mb-4 mt-4 flex border-t border-border text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
        <span className="flex flex-1 items-center justify-center gap-2 py-2.5">
          <Copy className="size-3.5" /> Copy reply
        </span>
        <span className="flex flex-1 items-center justify-center gap-2 border-l border-border py-2.5">
          <Check className="size-3.5" /> Mark
        </span>
        <span className="flex flex-1 items-center justify-center gap-2 border-l border-border py-2.5">
          <X className="size-3.5" /> Skip
        </span>
      </div>
    </Frame>
  );
}

export function PreviewResults() {
  const rows = [
    { label: "Reddit", Icon: FaRedditAlien, bg: "#FF4500", n: 9840 },
    { label: "Hacker News", Icon: FaHackerNews, bg: "#FF6600", n: 5310 },
    { label: "Indie Hackers", Icon: FaRegLightbulb, bg: "#0E2439", n: 3120 },
    { label: "Bluesky", Icon: FaBluesky, bg: "#0085FF", n: 1465 },
  ];
  const max = rows[0].n;
  return (
    <Frame>
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-semibold text-foreground">20,515</p>
        <p className="text-xs text-muted-foreground">clicks this month</p>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span
              className="flex size-6 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: r.bg }}
            >
              <r.Icon className="size-3 text-white" />
            </span>
            <span className="w-24 shrink-0 text-xs text-muted-foreground">
              {r.label}
            </span>
            <span className="h-2 flex-1 rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-neutral-900"
                style={{ width: `${(r.n / max) * 100}%` }}
              />
            </span>
            <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">
              {r.n.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

const PREVIEWS = [PreviewRead, PreviewRank, PreviewReply, PreviewResults];

/* ---------------- variants ---------------- */

// A: plain zigzag, text and preview equal width
function VariantA() {
  return (
    <div className="flex flex-col gap-20">
      {STEPS.map((step, i) => (
        <div
          key={step.n}
          className={cn(
            "grid items-center gap-10 md:grid-cols-2",
            i % 2 === 1 && "md:[&>*:first-child]:order-2",
          )}
        >
          <div>
            <p className="text-xs font-bold tracking-widest text-muted-foreground/70">
              {step.n}
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="mt-3 text-base text-muted-foreground">{step.body}</p>
          </div>
          {PREVIEWS[i]()}
        </div>
      ))}
    </div>
  );
}

// B: zigzag with a rule and a wider preview
function VariantB() {
  return (
    <div className="flex flex-col divide-y divide-border">
      {STEPS.map((step, i) => (
        <div
          key={step.n}
          className={cn(
            "grid items-center gap-10 py-14 md:grid-cols-[minmax(0,4fr)_minmax(0,6fr)]",
            i % 2 === 1 && "md:[&>*:first-child]:order-2",
          )}
        >
          <div>
            <h3 className="text-2xl font-semibold text-foreground">
              <span className="mr-3 text-muted-foreground/50">{step.n}</span>
              {step.title}
            </h3>
            <p className="mt-3 text-base text-muted-foreground">{step.body}</p>
          </div>
          {PREVIEWS[i]()}
        </div>
      ))}
    </div>
  );
}

// C: preview sits in a tinted panel, text stays clean
function VariantC() {
  return (
    <div className="flex flex-col gap-6">
      {STEPS.map((step, i) => (
        <div
          key={step.n}
          className={cn(
            "grid items-center gap-8 rounded-2xl bg-muted/40 p-8 md:grid-cols-2",
            i % 2 === 1 && "md:[&>*:first-child]:order-2",
          )}
        >
          <div className="px-2">
            <p className="text-xs font-bold tracking-widest text-muted-foreground/70">
              STEP {step.n}
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="mt-3 text-base text-muted-foreground">{step.body}</p>
          </div>
          {PREVIEWS[i]()}
        </div>
      ))}
    </div>
  );
}

// D: panelled, but the preview bleeds off the panel edge
function VariantD() {
  return (
    <div className="flex flex-col gap-6">
      {STEPS.map((step, i) => (
        <div
          key={step.n}
          className={cn(
            "grid items-center gap-8 overflow-hidden rounded-2xl bg-muted/40 lg:grid-cols-2",
            i % 2 === 1 && "lg:[&>*:first-child]:order-2",
          )}
        >
          <div className="p-10">
            <p className="text-xs font-bold tracking-widest text-muted-foreground/70">
              STEP {step.n}
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="mt-3 text-base text-muted-foreground">{step.body}</p>
          </div>
          <div
            className={cn(
              "py-10",
              i % 2 === 1 ? "-ml-10 pl-10" : "-mr-10 pr-10",
            )}
          >
            {PREVIEWS[i]()}
          </div>
        </div>
      ))}
    </div>
  );
}

// E: numbered rail down the left, panels to the right of it
function VariantE() {
  return (
    <div className="flex flex-col">
      {STEPS.map((step, i) => (
        <div key={step.n} className="flex gap-8">
          <div className="hidden w-12 shrink-0 flex-col items-center md:flex">
            <span className="flex size-10 items-center justify-center rounded-full border border-border text-xs font-bold text-muted-foreground">
              {step.n}
            </span>
            {i < STEPS.length - 1 ? (
              <span className="w-px flex-1 bg-muted" />
            ) : null}
          </div>
          <div className="flex-1 pb-10">
            <h3 className="text-2xl font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="mt-2 max-w-lg text-base text-muted-foreground">
              {step.body}
            </p>
            <div className="mt-5 rounded-2xl bg-muted/40 p-6">
              {PREVIEWS[i]()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// F: the copy sticks while the previews scroll past it
function VariantF() {
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <h3 className="text-3xl font-semibold text-foreground">
          Four steps, once a day
        </h3>
        <ol className="mt-8 flex flex-col gap-6">
          {STEPS.map((step) => (
            <li key={step.n} className="flex gap-4">
              <span className="text-xs font-bold tracking-widest text-muted-foreground/70">
                {step.n}
              </span>
              <span>
                <span className="block text-base font-medium text-foreground">
                  {step.title}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {step.body}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col gap-6">
        {STEPS.map((step, i) => (
          <div key={step.n} className="rounded-2xl bg-muted/40 p-6">
            {PREVIEWS[i]()}
          </div>
        ))}
      </div>
    </div>
  );
}

const VARIANTS = [
  { key: "A", name: "Plain zigzag", note: "Equal halves, generous gap, nothing around the preview but its own frame.", Render: VariantA },
  { key: "B", name: "Zigzag with rules", note: "Rows separated by hairlines and the preview given more width than the text.", Render: VariantB },
  { key: "C", name: "Panelled", note: "Each step sits in its own tinted block, so the section reads as four objects rather than four rows. Live on the landing now.", Render: VariantC },
  { key: "D", name: "Panelled, preview bleeds out", note: "Same panels, but the screenshot runs off the edge so it reads as a window into something bigger.", Render: VariantD },
  { key: "E", name: "Numbered rail", note: "A connected spine of numbers down the left with the panels beside it. Makes the order explicit.", Render: VariantE },
  { key: "F", name: "Sticky copy", note: "All four steps stated once on the left while the previews scroll past. Shortest to read, needs the visuals to stand alone.", Render: VariantF },
];

export default function StepVersions() {
  return (
    <main className="light-page min-h-screen bg-background px-6 py-16 font-sans">
      <header className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold text-foreground">
          How it works, alternating layouts
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Text one side, a preview of the real screen on the other, flipping
          each row.
        </p>
      </header>

      {VARIANTS.map(({ key, name, note, Render }) => (
        <section key={key} className="mx-auto mt-24 max-w-5xl">
          <div className="flex items-baseline gap-3">
            <span className="bg-neutral-900 px-2 py-0.5 text-xs font-bold text-white">
              {key}
            </span>
            <h2 className="text-lg font-medium text-foreground">{name}</h2>
          </div>
          <p className="mt-2 mb-10 text-sm text-muted-foreground">{note}</p>
          <Render />
        </section>
      ))}
    </main>
  );
}
