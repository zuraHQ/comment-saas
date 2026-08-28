import {
  FaBluesky,
  FaGithub,
  FaLinkedinIn,
  FaHackerNews,
  FaInstagram,
  FaRegLightbulb,
  FaRedditAlien,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Globe, Link2 } from "lucide-react";
import Container from "./container";
import SiteCapture from "./site-capture";
import {
  PreviewRank,
  PreviewRead,
  PreviewReply,
  PreviewResults,
} from "./step-versions";
import Heading from "./heading";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- 01 */
// Raw chatter arriving from every platform at once.

const CHATTER = [
  {
    text: "anyone know a good invoicing tool?",
    Icon: FaRedditAlien,
    color: "#FF4500",
    at: "top-10 left-6",
  },
  {
    text: "spreadsheets are killing me",
    Icon: FaHackerNews,
    color: "#FF6600",
    at: "top-24 right-6",
  },
  {
    text: "best way to track leads?",
    Icon: FaLinkedinIn,
    color: "#0A66C2",
    at: "bottom-24 left-6",
  },
  {
    text: "we still do this by hand",
    Icon: FaBluesky,
    color: "#0085FF",
    at: "bottom-10 right-6",
  },
];


function ScanVisual() {
  return (
    <div className="relative flex h-80 items-center justify-center overflow-hidden">
      {/* Radar rings with a rotating sweep */}
      <div className="absolute flex h-72 w-72 items-center justify-center rounded-full border border-neutral-200">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(14,165,233,0.25), rgba(14,165,233,0) 35%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        <div className="flex h-48 w-48 items-center justify-center rounded-full border border-neutral-200">
          <div className="flex h-24 w-24 bg-white items-center justify-center rounded-full border border-neutral-200">
            <Globe className="h-6 w-6 text-neutral-600" strokeWidth={1.25} />
          </div>
        </div>
      </div>

      {/* Chatter picked up by the sweep, sitting around the dial */}
      {CHATTER.map((item, i) => (
        <motion.span
          key={item.text}
          className={cn(
            "absolute z-10 flex max-w-[38%] items-center gap-1.5",
            item.at,
          )}
          initial={{ opacity: 0.35 }}
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{
            duration: 4,
            times: [0, 0.2, 1],
            repeat: Infinity,
            delay: i,
            ease: "easeInOut",
          }}
        >
          <span
            className="flex size-5 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: item.color }}
          >
            <item.Icon className="size-2.5 text-white" />
          </span>
          <span className="text-xs leading-snug font-medium text-neutral-900">
            {item.text}
          </span>
        </motion.span>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- 02 */
// One post at a time: the model reads it, then says what it is and how hot.
const JUDGED = [
  {
    author: "u/marta_builds",
    score: 94,
    where: "Reddit",
    time: "4m",
    text: "Looking for a simple invoicing tool for freelancers. Everything I try wants an enterprise plan.",
    Icon: FaRedditAlien,
    color: "#FF4500",
    intent: "High",
    verdict:
      "Asking for a tool like yours, and priced out of the alternatives.",
  },
  {
    author: "Priya S.",
    score: 91,
    where: "LinkedIn",
    time: "11m",
    text: "Our finance ops still run on three spreadsheets. Open to recommendations.",
    Icon: FaLinkedinIn,
    color: "#0A66C2",
    intent: "High",
    verdict:
      "Describes the exact manual work you replace, and invites suggestions.",
  },
  {
    author: "tomasz",
    score: 61,
    where: "Hacker News",
    time: "26m",
    text: "Has anyone actually run a CRM out of Notion long term? Curious how it holds up.",
    Icon: FaHackerNews,
    color: "#FF6600",
    intent: "Medium",
    verdict: "Adjacent problem. Worth a helpful reply, unlikely to buy today.",
  },
  {
    author: "@buildwithsam",
    score: 12,
    where: "X/Twitter",
    time: "38m",
    text: "just launched v2 today, thanks to everyone who tested it",
    Icon: FaXTwitter,
    color: "#171717",
    intent: "Low",
    verdict: "Launch announcement. Nothing here to answer.",
  },
];



const INTENT_CHIP: Record<string, string> = {
  High: "bg-[#FF6600] text-[#101010]",
  Medium: "bg-[#FFC53D] text-[#101010]",
  Low: "bg-neutral-100 text-neutral-500",
};

// A, developed: scanning bar over the post, score counting up, the reason
// written out, and a queue strip showing what has already been judged.
const READ_MS = 2200;
const HOLD_MS = 6000;

function SortVisual() {
  const [index, setIndex] = useState(0);
  const [reading, setReading] = useState(true);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setScore(0);
    const done = setTimeout(() => setReading(false), READ_MS);
    const next = setTimeout(() => {
      setIndex((i) => (i + 1) % JUDGED.length);
      setReading(true);
    }, HOLD_MS);
    return () => {
      clearTimeout(done);
      clearTimeout(next);
    };
  }, [index]);

  const post = JUDGED[index];

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
        : "rgba(0,0,0,0.25)";

  const circumference = 2 * Math.PI * 52;

  return (
    <div className="flex h-80 flex-col justify-center gap-3">
      <div className="rounded-xl border border-neutral-200 bg-neutral-50">
        <div className="flex items-center gap-6 p-6">
          {/* The dial */}
          <div className="relative shrink-0">
            <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="52"
                stroke="rgba(0,0,0,0.08)"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                stroke={accent}
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                initial={false}
                animate={{
                  strokeDashoffset:
                    circumference -
                    (reading ? 0 : (post.score / 100) * circumference),
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-3xl font-semibold tabular-nums"
                style={{ color: reading ? "rgba(0,0,0,0.25)" : accent }}
              >
                {reading ? "--" : score}
              </span>
              <span className="text-[9px] tracking-wider text-neutral-400 uppercase">
                Intent
              </span>
            </div>
          </div>

          {/* The post it is judging */}
          <AnimatePresence mode="wait">
            <motion.div
              key={post.author}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="min-w-0 flex-1"
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center"
                  style={{ backgroundColor: post.color }}
                >
                  <post.Icon
                    className="h-3 w-3"
                    style={{
                      color: post.color === "#ffffff" ? "#000000" : "#ffffff",
                    }}
                  />
                </span>
                <span className="truncate text-[11px] text-neutral-500">
                  {post.author} · {post.where} · {post.time}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 h-8 text-xs text-neutral-700">
                {post.text}
              </p>
              <div className="mt-3 h-8">
                {reading ? (
                  <span className="flex items-center gap-3">
                    <span className="flex gap-1">
                      {[0, 1, 2].map((dot) => (
                        <motion.span
                          key={dot}
                          className="h-1.5 w-1.5 rounded-full bg-neutral-300"
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay: dot * 0.15,
                          }}
                        />
                      ))}
                    </span>
                    <span className="text-[10px] tracking-wider text-neutral-500 uppercase">
                      Matching against your product...
                    </span>
                  </span>
                ) : (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="line-clamp-2 text-xs text-neutral-600"
                  >
                    {post.verdict}
                  </motion.p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}

/* ---------------------------------------------------------------- 03 */
// A real thread: post with an avatar, your reply nested under it.
function ReplyVisual() {
  return (
    <div className="flex h-80 flex-col justify-center">
      <div className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200">
        <article className="p-4">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.dicebear.com/9.x/notionists/svg?seed=marta&backgroundColor=1f2937"
              alt=""
              className="h-7 w-7 shrink-0 rounded-full bg-neutral-50"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-neutral-700">
                u/marta_builds
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                <FaRedditAlien className="h-3 w-3 text-[#FF4500]" />
                Reddit · 4m
              </p>
            </div>
            <span className="ml-auto bg-[#FF6600] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#101010] uppercase">
              High
            </span>
          </div>
          <p className="mt-3 text-xs text-neutral-700">
            How do you find the threads where people are actually asking for a
            product like yours? Searching manually every day is killing me.
          </p>
          <div className="mt-3 flex items-center gap-4 text-[11px] text-neutral-400">
            <span>▲ 47</span>
            <span>12 comments</span>
            <span>share</span>
          </div>
        </article>

        <div className="bg-neutral-50 p-4 pl-10">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.dicebear.com/9.x/notionists/svg?seed=founder&backgroundColor=a3ff12"
              alt=""
              className="ring-brand/60 h-7 w-7 shrink-0 rounded-full bg-neutral-50 ring-1"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-neutral-700">you</p>
              <p className="text-[11px] text-neutral-400">just now</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-neutral-700">
            Had the same problem, so I built something for it. It reads the
            communities for you and scores what is worth answering —{" "}
            <span className="text-brand underline underline-offset-2">
              commentsaas.com
            </span>
          </p>
          <div className="mt-3 flex items-center gap-4 text-[11px] text-neutral-400">
            <span>▲ 8</span>
            <span>reply</span>
            <span>share</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- 04 */
const CLICK_SOURCES = [
  { label: "Reddit", Icon: FaRedditAlien, color: "#FF4500", clicks: 9840 },
  { label: "Hacker News", Icon: FaHackerNews, color: "#FF6600", clicks: 5310 },
  { label: "LinkedIn", Icon: FaLinkedinIn, color: "#0A66C2", clicks: 3120 },
  { label: "X/Twitter", Icon: FaXTwitter, color: "#171717", clicks: 1465 },
  { label: "Instagram", Icon: FaInstagram, color: "#E4405F", clicks: 780 },
];

// Bars grow once, the total counts up with them.
function ResultVisual() {
  const total = CLICK_SOURCES.reduce((sum, s) => sum + s.clicks, 0);
  const max = Math.max(...CLICK_SOURCES.map((s) => s.clicks));

  return (
    <div className="flex h-80 flex-col justify-center gap-5">
      <div className="flex items-end gap-6">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
            Link clicks
          </p>
          <motion.p
            className="text-2xl font-semibold text-neutral-900"
            initial={{ opacity: 0.4 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {total.toLocaleString()}
          </motion.p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
            Replies sent
          </p>
          <p className="text-2xl font-semibold text-neutral-900">2,140</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
            Best channel
          </p>
          <p className="text-2xl font-semibold text-neutral-900">Reddit</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {CLICK_SOURCES.map((source, i) => (
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
            <span className="w-24 shrink-0 text-xs text-neutral-600">
              {source.label}
            </span>
            <span className="relative h-1.5 flex-1 rounded-full bg-neutral-200">
              <motion.span
                className="bg-primary absolute inset-y-0 left-0 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${(source.clicks / max) * 100}%` }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: "easeOut" }}
              />
            </span>
            <span className="w-12 shrink-0 text-right text-xs tabular-nums text-neutral-600">
              {source.clicks.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ---------------------------------------------------------------- rows */
const STEPS = [
  {
    number: "01",
    title: "We read eight platforms end to end",
    body: "We read every new post in the communities your customers sit in.",
    visual: <ScanVisual />,
  },
  {
    number: "02",
    title: "We rank them",
    body: "Every post is scored against what your product actually does. The rest never reaches your feed.",
    visual: <SortVisual />,
  },
  {
    number: "03",
    title: "The reply is already written",
    body: "A draft in your voice, mentioning your product once, where it answers the question.",
    visual: <PreviewReply />,
  },
  {
    number: "04",
    title: "You see which conversations paid off",
    body: "Every reply carries a tracked link, so clicks come back tagged with the platform they came from.",
    visual: <PreviewResults />,
  },
];

export default function Stats() {
  return (
    <section className="relative w-full pt-8 pb-24">
      <Container className="relative z-10 mx-auto">
        <div
          id="how-it-works"
          className="mb-16 flex flex-col items-center text-center"
        >
          <Heading
            as="h2"
            variant="big"
            className="text-foreground font-sans font-bold text-balance lg:text-[60px] lg:leading-[1.05]"
          >
            We read the internet <br />
            so you don&apos;t have to
          </Heading>
        </div>

        {/* Each step is its own panel, alternating side to side */}
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={cn(
                "grid items-stretch overflow-hidden rounded-md border border-neutral-200/70 bg-neutral-50 shadow-[0_1px_2px_rgba(0,0,0,0.03)] lg:grid-cols-2",
                i % 2 === 1 && "lg:[&>*:first-child]:order-2",
              )}
            >
              <div className="self-center p-8 lg:p-10">
                <h3 className="text-4xl leading-[1.1] font-semibold text-neutral-900">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-neutral-600">
                  {step.body}
                </p>
              </div>
              <div className="flex items-center justify-center p-8 lg:p-10">
                {step.visual}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20">
          <SiteCapture />
        </div>
      </Container>
    </section>
  );
}
