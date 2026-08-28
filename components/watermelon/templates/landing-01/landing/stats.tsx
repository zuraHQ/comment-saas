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

// A log of what we just finished reading, scrolling without end.
const SCAN_LOG = [
  { where: "r/SaaS", n: "42 new posts", Icon: FaRedditAlien, bg: "#FF4500" },
  { where: "Hacker News", n: "18 new stories", Icon: FaHackerNews, bg: "#FF6600" },
  { where: "r/freelance", n: "27 new posts", Icon: FaRedditAlien, bg: "#FF4500" },
  { where: "Indie Hackers", n: "9 new posts", Icon: FaRegLightbulb, bg: "#0E2439" },
  { where: "Bluesky", n: "61 new posts", Icon: FaBluesky, bg: "#0085FF" },
  { where: "r/smallbusiness", n: "33 new posts", Icon: FaRedditAlien, bg: "#FF4500" },
  { where: "GitHub", n: "6 new discussions", Icon: FaGithub, bg: "#171717" },
  { where: "LinkedIn", n: "14 new posts", Icon: FaLinkedinIn, bg: "#0A66C2" },
  { where: "X / Twitter", n: "88 new posts", Icon: FaXTwitter, bg: "#171717" },
  { where: "YouTube", n: "11 new videos", Icon: FaYoutube, bg: "#FF0000" },
];

function ScanVisual() {
  return (
    <div className="relative h-72 w-full overflow-hidden">
      <motion.div
        className="flex flex-col"
        animate={{ y: ["0%", "-50%"] }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      >
        {[...SCAN_LOG, ...SCAN_LOG].map((line, i) => (
          <span key={i} className="mb-3 flex items-center gap-2.5">
            <span
              className="flex size-5 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: line.bg }}
            >
              <line.Icon className="size-2.5 text-white" />
            </span>
            <span className="truncate text-xs font-medium text-neutral-900">
              {line.where}
            </span>
            <span className="ml-auto shrink-0 text-xs text-neutral-500">
              {line.n}
            </span>
          </span>
        ))}
      </motion.div>

      {/* Fade the bottom so the log reads as endless */}
      {/* Fade both ends into the panel so the log has no edges */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-neutral-50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-neutral-50 to-transparent" />
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
  // Walk the list, scoring one post at a time, then start over.
  const [judged, setJudged] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setJudged((n) => (n > JUDGED.length ? 0 : n + 1));
    }, 1100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex w-full flex-col gap-3">
      {JUDGED.map((post, i) => {
        const done = i < judged;
        const accent =
          post.intent === "High"
            ? "#FF6600"
            : post.intent === "Medium"
              ? "#FFC53D"
              : "#d4d4d4";
        return (
          <div
            key={post.author}
            className={cn(
              "rounded-md border border-neutral-200 bg-white p-3 transition-opacity duration-500",
              done && post.intent === "Low" && "opacity-40",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded"
                style={{ backgroundColor: post.color }}
              >
                <post.Icon
                  className="size-2.5"
                  style={{
                    color: post.color === "#171717" ? "#ffffff" : "#ffffff",
                  }}
                />
              </span>
              <span className="truncate text-xs text-neutral-500">
                {post.author} · {post.where}
              </span>
              <span className="ml-auto shrink-0 text-xs tabular-nums">
                {done ? (
                  <span style={{ color: accent }} className="font-semibold">
                    {post.score}
                  </span>
                ) : (
                  <span className="text-neutral-300">--</span>
                )}
              </span>
            </div>

            <p className="mt-1.5 line-clamp-1 text-sm font-medium text-neutral-900">
              {post.text}
            </p>

            <div className="mt-2 h-1 w-full rounded-full bg-neutral-100">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: accent }}
                initial={{ width: 0 }}
                animate={{ width: done ? `${post.score}%` : 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        );
      })}
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
    title: "Eight platforms, end to end",
    body: "Every new post in the communities your customers already sit in.",
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
