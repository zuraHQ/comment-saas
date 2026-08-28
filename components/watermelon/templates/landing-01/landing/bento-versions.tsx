"use client";

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
import { Check, Copy, Link2, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Bento is not the four steps again. These are the things you get, sized by
// how much they matter.
const MARKS = [
  { label: "Reddit", Icon: FaRedditAlien, bg: "#FF4500", fg: "#ffffff" },
  { label: "Hacker News", Icon: FaHackerNews, bg: "#FF6600", fg: "#ffffff" },
  { label: "Indie Hackers", Icon: FaRegLightbulb, bg: "#0E2439", fg: "#ffffff" },
  { label: "X / Twitter", Icon: FaXTwitter, bg: "#171717", fg: "#ffffff" },
  { label: "LinkedIn", Icon: FaLinkedinIn, bg: "#0A66C2", fg: "#ffffff" },
  { label: "YouTube", Icon: FaYoutube, bg: "#FF0000", fg: "#ffffff" },
  { label: "Bluesky", Icon: FaBluesky, bg: "#0085FF", fg: "#ffffff" },
  { label: "GitHub", Icon: FaGithub, bg: "#171717", fg: "#ffffff" },
];

function Tile({
  title,
  body,
  className,
  children,
}: {
  title: string;
  body?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-md border border-neutral-200/70 bg-neutral-50 p-6",
        className,
      )}
    >
      <div>
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        {body ? (
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
            {body}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function Platforms() {
  return (
    <div className="mt-auto flex flex-wrap gap-2">
      {MARKS.map((m) => (
        <span
          key={m.label}
          title={m.label}
          className="flex size-9 items-center justify-center rounded"
          style={{ backgroundColor: m.bg }}
        >
          <m.Icon className="size-4" style={{ color: m.fg }} />
        </span>
      ))}
    </div>
  );
}

function Draft() {
  return (
    <div className="mt-auto rounded-md border border-neutral-200 bg-white p-3">
      <p className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
        You, replying
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">
        Been exactly here. The chasing was the part that ate my Fridays, so I
        ended up building Acme around it.
      </p>
      <div className="mt-3 flex gap-2 text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
        <span className="flex items-center gap-1.5">
          <Copy className="size-3" /> Copy
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="size-3" /> Mark
        </span>
        <span className="flex items-center gap-1.5">
          <X className="size-3" /> Skip
        </span>
      </div>
    </div>
  );
}

function Scores() {
  const rows = [
    { t: "Looking for a simple invoicing tool", s: 94 },
    { t: "How do you handle late payers", s: 81 },
    { t: "just launched v2 today", s: 12 },
  ];
  return (
    <div className="mt-auto flex flex-col gap-2.5">
      {rows.map((r) => (
        <div key={r.t} className="flex items-center gap-3">
          <span className="min-w-0 flex-1 truncate text-xs text-neutral-600">
            {r.t}
          </span>
          <span className="h-1.5 w-20 shrink-0 rounded-full bg-neutral-200">
            <span
              className="block h-full rounded-full bg-neutral-900"
              style={{ width: `${r.s}%` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

function Clicks() {
  return (
    <div className="mt-auto">
      <p className="text-3xl font-semibold text-neutral-900">20,515</p>
      <p className="mt-1 text-xs text-neutral-500">
        clicks, tagged by where they came from
      </p>
    </div>
  );
}

export default function BentoVersions() {
  return (
    <main className="light-page min-h-screen bg-white px-6 py-16 font-sans">
      <header className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold text-neutral-900">
          What you get
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Not the four steps again. The pieces, sized by how much they matter.
        </p>
      </header>

      <section className="mx-auto mt-14 grid max-w-5xl gap-4 lg:grid-cols-3">
        <Tile
          className="lg:col-span-2"
          title="Eight platforms, read end to end"
          body="Whole communities, every new post, not keyword alerts waiting for someone to type your name."
        >
          <Platforms />
        </Tile>

        <Tile
          title="Ranked by intent"
          body="Scored against what your product does, so you read ten posts instead of four hundred."
        >
          <Scores />
        </Tile>

        <Tile
          title="A reply, already written"
          body="In your words, mentioning the product once, where it answers the question."
          className="lg:col-span-2"
        >
          <Draft />
        </Tile>

        <Tile title="You see what worked">
          <Clicks />
        </Tile>

        <Tile title="One link, tracked">
          <p className="mt-auto flex items-center gap-2 text-sm text-neutral-600">
            <Link2 className="size-4 shrink-0" />
            No per post setup. Paste the same link everywhere.
          </p>
        </Tile>

        <Tile title="Every product you run">
          <p className="mt-auto text-sm text-neutral-600">
            Separate keywords, separate feed, separate numbers.
          </p>
        </Tile>

        <Tile title="Ten minutes a day">
          <p className="mt-auto text-sm text-neutral-600">
            Two minutes to set up. Then read, send, done.
          </p>
        </Tile>
      </section>
    </main>
  );
}
