"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  FaHackerNews,
  FaLinkedinIn,
  FaRedditAlien,
  FaXTwitter,
} from "react-icons/fa6";
import { ArrowUpRight, Check, Link2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const POSTS = [
  {
    author: "u/marta_builds",
    where: "Reddit",
    time: "4m",
    text: "Looking for a simple invoicing tool for freelancers. Everything I try wants an enterprise plan.",
    Icon: FaRedditAlien,
    color: "#FF4500",
    intent: "High",
    score: 94,
    verdict: "Asking for a tool like yours, and priced out of the alternatives.",
  },
  {
    author: "Priya S.",
    where: "LinkedIn",
    time: "11m",
    text: "Our finance ops still run on three spreadsheets. Open to recommendations.",
    Icon: FaLinkedinIn,
    color: "#0A66C2",
    intent: "High",
    score: 91,
    verdict: "Describes the manual work you replace, and invites suggestions.",
  },
  {
    author: "tomasz",
    where: "Hacker News",
    time: "26m",
    text: "Has anyone actually run a CRM out of Notion long term?",
    Icon: FaHackerNews,
    color: "#FF6600",
    intent: "Medium",
    score: 61,
    verdict: "Adjacent problem. Worth a reply, unlikely to buy today.",
  },
  {
    author: "@buildwithsam",
    where: "X/Twitter",
    time: "38m",
    text: "just launched v2 today, thanks to everyone who tested it",
    Icon: FaXTwitter,
    color: "#ffffff",
    intent: "Low",
    score: 12,
    verdict: "Launch announcement. Nothing here to answer.",
  },
];

const CHIP: Record<string, string> = {
  High: "bg-[#FF6600] text-[#101010]",
  Medium: "bg-[#FFC53D] text-[#101010]",
  Low: "bg-white/10 text-white/40",
};

function Mark({ post }: { post: (typeof POSTS)[number] }) {
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center"
      style={{ backgroundColor: post.color }}
    >
      <post.Icon
        className="h-3 w-3"
        style={{ color: post.color === "#ffffff" ? "#000000" : "#ffffff" }}
      />
    </span>
  );
}

function useCycle(length: number, ms = 2600) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % length), ms);
    return () => clearInterval(t);
  }, [length, ms]);
  return i;
}

/* ------------------------------------------------------------------ A */
// Current build: one post, the model reads it, then gives a verdict.
function VersionA() {
  const [index, setIndex] = useState(0);
  const [reading, setReading] = useState(true);

  useEffect(() => {
    const verdict = setTimeout(() => setReading(false), 1100);
    const next = setTimeout(() => {
      setIndex((i) => (i + 1) % POSTS.length);
      setReading(true);
    }, 3000);
    return () => {
      clearTimeout(verdict);
      clearTimeout(next);
    };
  }, [index]);

  const post = POSTS[index];

  return (
    <div className="border border-white/10">
      <AnimatePresence mode="wait">
        <motion.article
          key={post.author}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="p-4"
        >
          <div className="flex items-center gap-2">
            <Mark post={post} />
            <span className="truncate text-[11px] text-white/40">
              {post.author} · {post.where} · {post.time}
            </span>
          </div>
          <p className="mt-2 text-xs text-white/75">{post.text}</p>
        </motion.article>
      </AnimatePresence>
      <div className="border-t border-white/10 p-4">
        {reading ? (
          <div className="flex items-center gap-3">
            <motion.span
              className="bg-primary h-1.5 w-1.5 rounded-full"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">
              AI reading the post...
            </span>
          </div>
        ) : (
          <>
            <span
              className={cn(
                "px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase",
                CHIP[post.intent],
              )}
            >
              {post.intent} intent
            </span>
            <p className="mt-2 text-xs text-white/60">{post.verdict}</p>
          </>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- A2 */
// A, developed: scanning bar over the post, score counting up, the reason
// written out, and a queue strip showing what has already been judged.
const READ_MS = 1300;
const HOLD_MS = 3400;

function VersionA2() {
  const [index, setIndex] = useState(0);
  const [reading, setReading] = useState(true);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setScore(0);
    const done = setTimeout(() => setReading(false), READ_MS);
    const next = setTimeout(() => {
      setIndex((i) => (i + 1) % POSTS.length);
      setReading(true);
    }, HOLD_MS);
    return () => {
      clearTimeout(done);
      clearTimeout(next);
    };
  }, [index]);

  const post = POSTS[index];

  // Count the score up once the read finishes.
  useEffect(() => {
    if (reading) return;
    let current = 0;
    const step = setInterval(() => {
      current += Math.max(1, Math.round(post.score / 18));
      if (current >= post.score) {
        current = post.score;
        clearInterval(step);
      }
      setScore(current);
    }, 26);
    return () => clearInterval(step);
  }, [reading, post.score]);

  const accent =
    post.intent === "High"
      ? "#FF6600"
      : post.intent === "Medium"
        ? "#FFC53D"
        : "rgba(255,255,255,0.25)";

  return (
    <div className="border border-white/10">
      <AnimatePresence mode="wait">
        <motion.article
          key={post.author}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="relative overflow-hidden p-4"
        >
          {/* Scan line sweeping down the post while it is being read */}
          {reading ? (
            <motion.span
              className="from-primary/0 via-primary/60 to-primary/0 pointer-events-none absolute inset-x-0 h-10 bg-gradient-to-b"
              initial={{ top: "-20%" }}
              animate={{ top: "110%" }}
              transition={{ duration: READ_MS / 1000, ease: "linear" }}
            />
          ) : null}

          <div className="flex items-center gap-2">
            <Mark post={post} />
            <span className="truncate text-[11px] text-white/40">
              {post.author} · {post.where} · {post.time}
            </span>
            <span className="ml-auto shrink-0 font-mono text-[10px] tracking-widest text-white/25 uppercase">
              {index + 1}/{POSTS.length}
            </span>
          </div>
          <p className="mt-2 text-xs text-white/75">{post.text}</p>
        </motion.article>
      </AnimatePresence>

      <div className="border-t border-white/10 p-4">
        <AnimatePresence mode="wait">
          {reading ? (
            <motion.div
              key={`r-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <span className="flex gap-1">
                {[0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    className="bg-primary h-1.5 w-1.5 rounded-full"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      delay: dot * 0.15,
                    }}
                  />
                ))}
              </span>
              <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">
                Matching against your product...
              </span>
            </motion.div>
          ) : (
            <motion.div
              key={`v-${index}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase",
                    CHIP[post.intent],
                  )}
                >
                  {post.intent} intent
                </span>
                <span className="relative h-1 flex-1 bg-white/10">
                  <motion.span
                    className="absolute inset-y-0 left-0"
                    style={{ backgroundColor: accent }}
                    initial={{ width: 0 }}
                    animate={{ width: `${post.score}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </span>
                <span
                  className="w-8 shrink-0 text-right font-mono text-xs tabular-nums"
                  style={{ color: accent }}
                >
                  {score}
                </span>
              </div>
              <p className="mt-2 text-xs text-white/60">{post.verdict}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Already judged, oldest first */}
      <div className="flex divide-x divide-white/10 border-t border-white/10">
        {POSTS.map((item, i) => (
          <span
            key={item.author}
            className={cn(
              "flex flex-1 items-center gap-1.5 px-2 py-2",
              i === index ? "bg-white/[0.04]" : "",
            )}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  i > index
                    ? "rgba(255,255,255,0.15)"
                    : item.intent === "High"
                      ? "#FF6600"
                      : item.intent === "Medium"
                        ? "#FFC53D"
                        : "rgba(255,255,255,0.25)",
              }}
            />
            <span className="truncate font-mono text-[9px] tracking-wider text-white/30 uppercase">
              {item.where}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ B */
// Chat: the model talks about the post like a teammate would.
function VersionB() {
  const index = useCycle(POSTS.length, 3400);
  const post = POSTS[index];

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="wait">
        <motion.div
          key={post.author}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col gap-3"
        >
          <article className="border border-white/10 p-3">
            <div className="flex items-center gap-2">
              <Mark post={post} />
              <span className="truncate text-[11px] text-white/40">
                {post.author} · {post.where}
              </span>
            </div>
            <p className="mt-2 text-xs text-white/70">{post.text}</p>
          </article>

          <div className="ml-6 flex items-start gap-2">
            <span className="bg-primary mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center font-mono text-[10px] font-bold text-[#101010]">
              AI
            </span>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="border-primary/30 bg-primary/[0.05] border px-3 py-2"
            >
              <p className="text-xs text-white/80">{post.verdict}</p>
              <span
                className={cn(
                  "mt-2 inline-block px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase",
                  CHIP[post.intent],
                )}
              >
                {post.intent}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ C */
// Scoreboard: every post visible, each with a score bar that fills.
function VersionC() {
  return (
    <div className="divide-y divide-white/10 border border-white/10">
      {POSTS.map((post, i) => (
        <div key={post.author} className="flex items-center gap-3 p-3">
          <Mark post={post} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-white/75">{post.text}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="relative h-1 w-24 bg-white/10">
                <motion.span
                  className={cn(
                    "absolute inset-y-0 left-0",
                    post.intent === "High"
                      ? "bg-[#FF6600]"
                      : post.intent === "Medium"
                        ? "bg-[#FFC53D]"
                        : "bg-white/20",
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${post.score}%` }}
                  transition={{ duration: 1, delay: i * 0.15 }}
                />
              </span>
              <span className="font-mono text-[10px] text-white/40">
                {post.score}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ D */
// Terminal: the scorer's log, line by line.
function VersionD() {
  const [lines, setLines] = useState(1);
  useEffect(() => {
    const t = setInterval(
      () => setLines((n) => (n >= POSTS.length ? 1 : n + 1)),
      1100,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="border border-white/10 bg-black/40 p-4 font-mono text-[11px]">
      <p className="text-white/30">$ scoring new posts</p>
      {POSTS.slice(0, lines).map((post) => (
        <motion.p
          key={post.author}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1.5 flex items-center gap-2"
        >
          <span className="text-white/30">→</span>
          <span className="truncate text-white/60">
            {post.where}: {post.text.slice(0, 34)}...
          </span>
          <span
            className={cn(
              "ml-auto shrink-0 px-1.5 font-bold uppercase",
              post.intent === "High"
                ? "text-[#FF6600]"
                : post.intent === "Medium"
                  ? "text-[#FFC53D]"
                  : "text-white/30",
            )}
          >
            {post.intent}
          </span>
        </motion.p>
      ))}
      <p className="mt-2 text-white/20">
        {lines}/{POSTS.length} scored
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ E */
// Split: raw posts on the left, only the keepers crossing to the right.
function VersionE() {
  const index = useCycle(POSTS.length, 2200);
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-[10px] tracking-widest text-white/30 uppercase">
          Incoming
        </p>
        {POSTS.map((post, i) => (
          <div
            key={post.author}
            className={cn(
              "flex items-center gap-2 border p-2 transition-colors",
              i === index ? "border-primary/40" : "border-white/10",
            )}
          >
            <Mark post={post} />
            <span className="truncate text-[11px] text-white/50">
              {post.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-mono text-[10px] tracking-widest text-white/30 uppercase">
          Worth answering
        </p>
        {POSTS.filter((p) => p.intent !== "Low").map((post) => (
          <div
            key={post.author}
            className="border-primary/30 bg-primary/[0.04] flex items-center gap-2 border p-2"
          >
            <Mark post={post} />
            <span className="truncate text-[11px] text-white/70">
              {post.text}
            </span>
            <span
              className={cn(
                "ml-auto shrink-0 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase",
                CHIP[post.intent],
              )}
            >
              {post.intent}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------ results: R1..R4 */
const CLICKS = [
  { label: "Reddit", Icon: FaRedditAlien, color: "#FF4500", clicks: 84 },
  { label: "Hacker News", Icon: FaHackerNews, color: "#FF6600", clicks: 51 },
  { label: "LinkedIn", Icon: FaLinkedinIn, color: "#0A66C2", clicks: 33 },
  { label: "X/Twitter", Icon: FaXTwitter, color: "#ffffff", clicks: 18 },
];
const TOTAL = CLICKS.reduce((sum, c) => sum + c.clicks, 0);
const MAX = Math.max(...CLICKS.map((c) => c.clicks));

// R1: current build - stat row plus bars.
function ResultsR1() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end gap-6">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-white/40 uppercase">
            Link clicks
          </p>
          <p className="text-primary text-4xl font-semibold">{TOTAL}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-widest text-white/40 uppercase">
            Replies sent
          </p>
          <p className="text-4xl font-semibold text-white">27</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {CLICKS.map((source) => (
          <div key={source.label} className="flex items-center gap-3">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center"
              style={{ backgroundColor: source.color }}
            >
              <source.Icon
                className="h-3.5 w-3.5"
                style={{
                  color: source.color === "#ffffff" ? "#000000" : "#ffffff",
                }}
              />
            </span>
            <span className="w-24 shrink-0 text-xs text-white/60">
              {source.label}
            </span>
            <span className="relative h-3 flex-1 bg-white/5">
              <motion.span
                className="bg-primary absolute inset-y-0 left-0"
                initial={{ width: 0 }}
                whileInView={{ width: `${(source.clicks / MAX) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              />
            </span>
            <span className="w-8 shrink-0 text-right text-xs text-white/60 tabular-nums">
              {source.clicks}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// R2: the link itself, then the clicks it brought back.
function ResultsR2() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 border border-white/10 p-3">
        <Link2 className="text-primary h-4 w-4 shrink-0" />
        <span className="truncate font-mono text-[11px] text-white/50">
          yoursaas.com/r/k3m9x2a
        </span>
        <span className="text-primary ml-auto shrink-0 font-mono text-[10px] font-bold tracking-widest uppercase">
          in your reply
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {CLICKS.slice(0, 3).map((source, i) => (
          <motion.div
            key={source.label}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3 border border-white/10 px-3 py-2"
          >
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center"
              style={{ backgroundColor: source.color }}
            >
              <source.Icon
                className="h-3 w-3"
                style={{
                  color: source.color === "#ffffff" ? "#000000" : "#ffffff",
                }}
              />
            </span>
            <span className="text-xs text-white/60">
              {source.clicks} clicks from {source.label}
            </span>
            <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-white/20" />
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-white/40">
        <span className="text-primary font-semibold">{TOTAL} visitors</span>{" "}
        this week, all from replies.
      </p>
    </div>
  );
}

// R3: one big number, the way a founder checks it.
function ResultsR3() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 border border-white/10 py-10">
      <p className="font-mono text-[10px] tracking-widest text-white/40 uppercase">
        Visitors from your replies
      </p>
      <p className="text-primary text-6xl font-semibold">{TOTAL}</p>
      <div className="flex items-center gap-2 text-xs text-white/40">
        <TrendingUp className="text-primary h-4 w-4" />
        up from 41 last week
      </div>
      <div className="mt-2 flex gap-2">
        {CLICKS.map((source) => (
          <span
            key={source.label}
            title={`${source.label}: ${source.clicks}`}
            className="flex h-6 w-6 items-center justify-center"
            style={{ backgroundColor: source.color }}
          >
            <source.Icon
              className="h-3.5 w-3.5"
              style={{
                color: source.color === "#ffffff" ? "#000000" : "#ffffff",
              }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}

// R4: the loop closing - reply, then what it produced.
function ResultsR4() {
  return (
    <div className="flex flex-col gap-2">
      <div className="border border-white/10 p-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center bg-[#FF4500]">
            <FaRedditAlien className="h-3 w-3 text-white" />
          </span>
          <span className="text-[11px] text-white/40">
            your reply · Reddit · 2d ago
          </span>
        </div>
        <p className="mt-2 text-xs text-white/70">
          Had the same problem, so I built something for it...
        </p>
      </div>

      <div className="flex justify-center py-1">
        <span className="h-4 w-px bg-white/15" />
      </div>

      <div className="border-primary/40 bg-primary/[0.05] flex items-center gap-3 border p-3">
        <span className="bg-primary flex h-6 w-6 shrink-0 items-center justify-center">
          <Check className="h-3.5 w-3.5 text-[#101010]" />
        </span>
        <span className="text-xs text-white/80">
          <span className="text-primary font-semibold">84 clicks</span> to your
          site
        </span>
        <span className="ml-auto font-mono text-[10px] tracking-widest text-white/30 uppercase">
          tracked
        </span>
      </div>
    </div>
  );
}

const VERSIONS = [
  { id: "A", title: "Read then verdict", body: "One post at a time. The model reads, then explains its call.", el: <VersionA /> },
  { id: "A2", title: "A, developed", body: "Scan line over the post, score counting up, and a strip of what has already been judged.", el: <VersionA2 /> },
  { id: "B", title: "AI as a teammate", body: "The model replies about the post like a person in a thread.", el: <VersionB /> },
  { id: "C", title: "Scoreboard", body: "Every post visible with a score bar. Static, no waiting.", el: <VersionC /> },
  { id: "D", title: "Terminal log", body: "Scoring as a live log. Technical, fast to read.", el: <VersionD /> },
  { id: "E", title: "Split funnel", body: "Everything on the left, only the keepers on the right.", el: <VersionE /> },
];

const RESULT_VERSIONS = [
  { id: "R1", title: "Stats and bars", body: "Current build: totals on top, clicks per platform underneath.", el: <ResultsR1 /> },
  { id: "R2", title: "Link then clicks", body: "Shows the tracked link first, then what it brought back.", el: <ResultsR2 /> },
  { id: "R3", title: "One big number", body: "The number a founder actually checks, with the sources under it.", el: <ResultsR3 /> },
  { id: "R4", title: "Loop closed", body: "A reply from two days ago and the clicks it produced.", el: <ResultsR4 /> },
];

export default function RankVersions() {
  return (
    <main className="dark min-h-screen bg-[#0a0a0a] px-6 py-16 font-sans text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold">
          &ldquo;We rank them&rdquo; — versions
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Same content, five treatments. Pick one and I will drop it into the
          landing page.
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          {VERSIONS.map((version) => (
            <section key={version.id}>
              <p className="text-primary font-mono text-xs font-bold tracking-widest uppercase">
                Version {version.id}
              </p>
              <h2 className="mt-1 text-lg font-semibold">{version.title}</h2>
              <p className="mt-1 mb-5 text-sm text-white/50">{version.body}</p>
              {version.el}
            </section>
          ))}
        </div>

        <h1 className="mt-24 text-2xl font-semibold">
          &ldquo;You get customers&rdquo; — versions
        </h1>
        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          {RESULT_VERSIONS.map((version) => (
            <section key={version.id}>
              <p className="text-primary font-mono text-xs font-bold tracking-widest uppercase">
                Version {version.id}
              </p>
              <h2 className="mt-1 text-lg font-semibold">{version.title}</h2>
              <p className="mt-1 mb-5 text-sm text-white/50">{version.body}</p>
              {version.el}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
