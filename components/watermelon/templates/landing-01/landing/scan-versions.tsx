"use client";

import { motion } from "motion/react";
import {
  FaBluesky,
  FaGithub,
  FaHackerNews,
  FaLinkedinIn,
  FaRedditAlien,
  FaRegLightbulb,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

const PLATFORMS = [
  { label: "Reddit", Icon: FaRedditAlien, bg: "#FF4500", fg: "#fff", posts: 412, ago: "2m ago" },
  { label: "Hacker News", Icon: FaHackerNews, bg: "#FF6600", fg: "#fff", posts: 96, ago: "1m ago" },
  { label: "Indie Hackers", Icon: FaRegLightbulb, bg: "#0E2439", fg: "#fff", posts: 38, ago: "4m ago" },
  { label: "X / Twitter", Icon: FaXTwitter, bg: "#171717", fg: "#fff", posts: 188, ago: "6m ago" },
  { label: "LinkedIn", Icon: FaLinkedinIn, bg: "#0A66C2", fg: "#fff", posts: 54, ago: "12m ago" },
  { label: "YouTube", Icon: FaYoutube, bg: "#FF0000", fg: "#fff", posts: 31, ago: "9m ago" },
  { label: "Bluesky", Icon: FaBluesky, bg: "#0085FF", fg: "#fff", posts: 74, ago: "3m ago" },
  { label: "GitHub", Icon: FaGithub, bg: "#171717", fg: "#fff", posts: 21, ago: "8m ago" },
];

/* 1 — status board: looks like software that is actually running */
function StatusBoard() {
  return (
    <div className="rounded-md border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2.5">
        <span className="text-xs font-medium text-neutral-900">Reading now</span>
        <span className="flex items-center gap-1.5 text-[10px] tracking-wider text-neutral-500 uppercase">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          live
        </span>
      </div>
      {PLATFORMS.map((p) => (
        <div
          key={p.label}
          className="flex items-center gap-3 border-b border-neutral-100 px-4 py-2.5 last:border-b-0"
        >
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded"
            style={{ backgroundColor: p.bg }}
          >
            <p.Icon className="size-3" style={{ color: p.fg }} />
          </span>
          <span className="flex-1 truncate text-xs font-medium text-neutral-900">
            {p.label}
          </span>
          <span className="w-16 text-right text-xs tabular-nums text-neutral-600">
            {p.posts}
          </span>
          <span className="w-16 text-right text-[10px] text-neutral-400">
            {p.ago}
          </span>
        </div>
      ))}
    </div>
  );
}

/* 2 — the day's volume as pixels, the useful ones lit */
function HeatGrid() {
  const cells = Array.from({ length: 336 }, (_, i) => i % 27 === 5);
  return (
    <div className="rounded-md border border-neutral-200 bg-white p-5">
      <p className="text-3xl font-semibold text-neutral-900 tabular-nums">914</p>
      <p className="mt-1 text-xs text-neutral-500">posts read today</p>
      <div className="mt-4 flex flex-wrap gap-1">
        {cells.map((lit, i) => (
          <span
            key={i}
            className={`size-2 rounded-[1px] ${lit ? "bg-neutral-900" : "bg-neutral-200"}`}
          />
        ))}
      </div>
      <p className="mt-4 text-xs text-neutral-500">
        <span className="font-semibold text-neutral-900">12</span> worth
        answering
      </p>
    </div>
  );
}

/* 3 — a log, scrolling, like watching it work */
const LOG = [
  "r/SaaS · 42 new posts",
  "Hacker News · 18 new stories",
  "r/freelance · 27 new posts",
  "Indie Hackers · 9 new posts",
  "Bluesky · 61 new posts",
  "r/smallbusiness · 33 new posts",
  "GitHub · 6 new discussions",
  "LinkedIn · 14 new posts",
];

function LogStream() {
  return (
    <div className="h-64 overflow-hidden rounded-md border border-neutral-200 bg-white p-4">
      <motion.div
        className="flex flex-col"
        animate={{ y: ["0%", "-50%"] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        {[...LOG, ...LOG].map((line, i) => (
          <span
            key={i}
            className="mb-2 flex items-center gap-2 font-mono text-xs text-neutral-600"
          >
            <span className="size-1.5 shrink-0 rounded-full bg-neutral-300" />
            {line}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* 4 — counters, one per platform, all going up */
function Counters() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PLATFORMS.map((p) => (
        <div
          key={p.label}
          className="rounded-md border border-neutral-200 bg-white p-4"
        >
          <span
            className="flex size-7 items-center justify-center rounded"
            style={{ backgroundColor: p.bg }}
          >
            <p.Icon className="size-3.5" style={{ color: p.fg }} />
          </span>
          <p className="mt-3 text-xl font-semibold text-neutral-900 tabular-nums">
            {p.posts}
          </p>
          <p className="text-[10px] text-neutral-500">read today</p>
        </div>
      ))}
    </div>
  );
}

const VARIANTS = [
  { key: "A", name: "Status board", note: "Platform, posts read, when it last checked. Reads as software that is actually running, and the live dot does the work the radar was trying to do.", Render: StatusBoard },
  { key: "B", name: "Volume as pixels", note: "Every post today is one square, the twelve worth answering are dark. Sells the filtering and the breadth in one picture.", Render: HeatGrid },
  { key: "C", name: "Log stream", note: "A feed of what it just finished reading, scrolling forever. Closest to the radar in spirit, but concrete.", Render: LogStream },
  { key: "D", name: "Counters", note: "One tile per platform with a number. Simplest, and the eight tiles make the claim countable.", Render: Counters },
];

export default function ScanVersions() {
  return (
    <main className="light-page min-h-screen bg-white px-6 py-16 font-sans">
      <header className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Step 01 visuals
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Four ways to show &quot;we read eight platforms end to end&quot;.
        </p>
      </header>

      <div className="mx-auto mt-14 flex max-w-3xl flex-col gap-16">
        {VARIANTS.map(({ key, name, note, Render }) => (
          <section key={key}>
            <div className="flex items-baseline gap-3">
              <span className="bg-neutral-900 px-2 py-0.5 text-xs font-bold text-white">
                {key}
              </span>
              <h2 className="text-lg font-medium text-neutral-900">{name}</h2>
            </div>
            <p className="mt-2 mb-6 text-sm text-neutral-600">{note}</p>
            <div className="rounded-md bg-neutral-50 p-8">
              <Render />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
