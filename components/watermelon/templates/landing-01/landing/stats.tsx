import {
  FaBluesky,
  FaGithub,
  FaLinkedinIn,
  FaHackerNews,
  FaInstagram,
  FaRedditAlien,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import { Check, Globe, Link2 } from 'lucide-react';
import Container from './container';
import Heading from './heading';
import { cn } from '@/lib/utils';

/* ---------------------------------------------------------------- 01 */
// Raw chatter arriving from every platform at once.
const CHATTER = [
  { text: 'anyone know a good invoicing tool?', Icon: FaRedditAlien, color: '#FF4500' },
  { text: 'just launched v2 today', Icon: FaXTwitter, color: '#ffffff' },
  { text: "what's the best way to track leads?", Icon: FaLinkedinIn, color: '#0A66C2' },
  { text: 'need a better solution for scheduling', Icon: FaInstagram, color: '#E4405F' },
  { text: 'has anyone tried Notion for CRM?', Icon: FaHackerNews, color: '#FF6600' },
  { text: 'spreadsheets are killing me', Icon: FaRedditAlien, color: '#FF4500' },
];

function ScanVisual() {
  return (
    <div className="relative flex h-80 items-center justify-center overflow-hidden">
      {/* Radar rings with a rotating sweep */}
      <div className="absolute flex h-72 w-72 items-center justify-center rounded-full border border-white/10">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, rgba(163,255,18,0.25), rgba(163,255,18,0) 35%)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        <div className="flex h-48 w-48 items-center justify-center rounded-full border border-white/10">
          <div className="bg-background flex h-24 w-24 items-center justify-center rounded-full border border-white/15">
            <Globe className="h-6 w-6 text-white/60" strokeWidth={1.25} />
          </div>
        </div>
      </div>

      {/* Chatter picked up by the sweep */}
      <div className="relative z-10 flex w-full flex-col gap-2 px-6">
        {CHATTER.slice(0, 4).map((item, i) => (
          <motion.span
            key={item.text}
            className={cn(
              'bg-background/80 flex items-center gap-2 border border-white/10 px-3 py-1.5 text-xs text-white/60 backdrop-blur-sm',
              i % 2 === 0 ? 'mr-auto' : 'ml-auto',
            )}
            initial={{ opacity: 0.15 }}
            animate={{ opacity: [0.15, 1, 0.15] }}
            transition={{
              duration: 4,
              times: [0, 0.25, 1],
              repeat: Infinity,
              delay: i,
              ease: 'easeInOut',
            }}
          >
            <item.Icon
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: item.color }}
            />
            {item.text}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- 02 */
// One post at a time: the model reads it, then says what it is and how hot.
const JUDGED = [
  {
    author: 'u/marta_builds',
    score: 94,
    where: 'Reddit',
    time: '4m',
    text: 'Looking for a simple invoicing tool for freelancers. Everything I try wants an enterprise plan.',
    Icon: FaRedditAlien,
    color: '#FF4500',
    intent: 'High',
    verdict: 'Asking for a tool like yours, and priced out of the alternatives.',
  },
  {
    author: 'Priya S.',
    score: 91,
    where: 'LinkedIn',
    time: '11m',
    text: 'Our finance ops still run on three spreadsheets. Open to recommendations.',
    Icon: FaLinkedinIn,
    color: '#0A66C2',
    intent: 'High',
    verdict: 'Describes the exact manual work you replace, and invites suggestions.',
  },
  {
    author: 'tomasz',
    score: 61,
    where: 'Hacker News',
    time: '26m',
    text: 'Has anyone actually run a CRM out of Notion long term? Curious how it holds up.',
    Icon: FaHackerNews,
    color: '#FF6600',
    intent: 'Medium',
    verdict: 'Adjacent problem. Worth a helpful reply, unlikely to buy today.',
  },
  {
    author: '@buildwithsam',
    score: 12,
    where: 'X/Twitter',
    time: '38m',
    text: 'just launched v2 today, thanks to everyone who tested it',
    Icon: FaXTwitter,
    color: '#ffffff',
    intent: 'Low',
    verdict: 'Launch announcement. Nothing here to answer.',
  },
];

const INTENT_CHIP: Record<string, string> = {
  High: 'bg-[#FF6600] text-[#101010]',
  Medium: 'bg-[#FFC53D] text-[#101010]',
  Low: 'bg-white/10 text-white/40',
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
        : "rgba(255,255,255,0.25)";

  const circumference = 2 * Math.PI * 52;

  return (
    <div className="flex h-80 flex-col justify-center">
      <div className="border border-white/10">
        <div className="flex items-center gap-6 p-6">
          {/* The dial */}
          <div className="relative shrink-0">
            <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="52"
                stroke="rgba(255,255,255,0.08)"
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
                style={{ color: reading ? "rgba(255,255,255,0.25)" : accent }}
              >
                {reading ? "--" : score}
              </span>
              <span className="font-mono text-[9px] tracking-widest text-white/30 uppercase">
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
                <span className="truncate text-[11px] text-white/40">
                  {post.author} · {post.where} · {post.time}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 h-8 text-xs text-white/75">
                {post.text}
              </p>
              <div className="mt-3 h-8">
                {reading ? (
                  <span className="flex items-center gap-3">
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
                  </span>
                ) : (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="line-clamp-2 border-l-2 pl-3 text-xs text-white/60"
                    style={{ borderColor: accent }}
                  >
                    {post.verdict}
                  </motion.p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Already judged, oldest first */}
        <div className="flex shrink-0 divide-x divide-white/10 border-t border-white/10">
          {JUDGED.map((item, i) => (
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
    </div>
  );
}

/* ---------------------------------------------------------------- 03 */
// A real thread: post with an avatar, your reply nested under it.
function ReplyVisual() {
  return (
    <div className="flex h-80 flex-col justify-center">
      <div className="divide-y divide-white/10 border border-white/10">
        <article className="p-4">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.dicebear.com/9.x/notionists/svg?seed=marta&backgroundColor=1f2937"
              alt=""
              className="h-7 w-7 shrink-0 rounded-full bg-white/5"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/80">u/marta_builds</p>
              <p className="flex items-center gap-1.5 text-[11px] text-white/35">
                <FaRedditAlien className="h-3 w-3 text-[#FF4500]" />
                Reddit · 4m
              </p>
            </div>
            <span className="ml-auto bg-[#FF6600] px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-[#101010] uppercase">
              High
            </span>
          </div>
          <p className="mt-3 text-xs text-white/75">
            How do you find the threads where people are actually asking for a
            product like yours? Searching manually every day is killing me.
          </p>
          <div className="mt-3 flex items-center gap-4 text-[11px] text-white/30">
            <span>▲ 47</span>
            <span>12 comments</span>
            <span>share</span>
          </div>
        </article>

        <div className="bg-white/[0.03] p-4 pl-10">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.dicebear.com/9.x/notionists/svg?seed=founder&backgroundColor=a3ff12"
              alt=""
              className="ring-primary/60 h-7 w-7 shrink-0 rounded-full bg-white/5 ring-1"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/80">you</p>
              <p className="text-[11px] text-white/35">just now</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-white/80">
            Had the same problem, so I built something for it. It reads the
            communities for you and scores what is worth answering —{' '}
            <span className="text-primary underline underline-offset-2">
              commentsaas.com
            </span>
          </p>
          <div className="mt-3 flex items-center gap-4 text-[11px] text-white/30">
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
  { label: 'Reddit', Icon: FaRedditAlien, color: '#FF4500', clicks: 9840 },
  { label: 'Hacker News', Icon: FaHackerNews, color: '#FF6600', clicks: 5310 },
  { label: 'LinkedIn', Icon: FaLinkedinIn, color: '#0A66C2', clicks: 3120 },
  { label: 'X/Twitter', Icon: FaXTwitter, color: '#ffffff', clicks: 1465 },
  { label: 'Instagram', Icon: FaInstagram, color: '#E4405F', clicks: 780 },
];

// Bars grow once, the total counts up with them.
function ResultVisual() {
  const total = CLICK_SOURCES.reduce((sum, s) => sum + s.clicks, 0);
  const max = Math.max(...CLICK_SOURCES.map((s) => s.clicks));

  return (
    <div className="flex h-80 flex-col justify-center gap-5">
      <div className="flex items-end gap-6">
        <div>
          <p className="font-mono text-[10px] font-bold tracking-widest text-white/40 uppercase">
            Link clicks
          </p>
          <motion.p
            className="text-2xl font-semibold text-white"
            initial={{ opacity: 0.4 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {total.toLocaleString()}
          </motion.p>
        </div>
        <div>
          <p className="font-mono text-[10px] font-bold tracking-widest text-white/40 uppercase">
            Replies sent
          </p>
          <p className="text-2xl font-semibold text-white">2,140</p>
        </div>
        <div>
          <p className="font-mono text-[10px] font-bold tracking-widest text-white/40 uppercase">
            Best channel
          </p>
          <p className="text-2xl font-semibold text-white">Reddit</p>
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
                  color: source.color === '#ffffff' ? '#000000' : '#ffffff',
                }}
              />
            </span>
            <span className="w-24 shrink-0 text-xs text-white/60">
              {source.label}
            </span>
            <span className="relative h-1.5 flex-1 bg-white/5">
              <motion.span
                className="bg-primary absolute inset-y-0 left-0"
                initial={{ width: 0 }}
                whileInView={{ width: `${(source.clicks / max) * 100}%` }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: 'easeOut' }}
              />
            </span>
            <span className="w-12 shrink-0 text-right text-xs tabular-nums text-white/60">
              {source.clicks.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PLATFORM_MARKS = [
  { label: 'Reddit', Icon: FaRedditAlien, bg: '#FF4500', fg: '#ffffff' },
  { label: 'X/Twitter', Icon: FaXTwitter, bg: '#ffffff', fg: '#000000' },
  { label: 'Hacker News', Icon: FaHackerNews, bg: '#FF6600', fg: '#ffffff' },
  { label: 'LinkedIn', Icon: FaLinkedinIn, bg: '#0A66C2', fg: '#ffffff' },
  { label: 'Instagram', Icon: FaInstagram, bg: '#E4405F', fg: '#ffffff' },
  { label: 'TikTok', Icon: FaTiktok, bg: '#ffffff', fg: '#000000' },
  { label: 'YouTube', Icon: FaYoutube, bg: '#FF0000', fg: '#ffffff' },
  { label: 'GitHub', Icon: FaGithub, bg: '#ffffff', fg: '#000000' },
  { label: 'Bluesky', Icon: FaBluesky, bg: '#0085FF', fg: '#ffffff' },
];

/* ---------------------------------------------------------------- rows */
const STEPS = [
  {
    number: '01',
    title: 'We pull posts and comments from 9 platforms',
    body: 'Whole communities and comment sections read end to end, not just keyword hits, so nothing relevant slips past.',
    marks: true,
    visual: <ScanVisual />,
  },
  {
    number: '02',
    title: 'We rank them',
    body: 'Every post is scored against what your product actually does. High intent rises to the top, the rest never reaches your feed, and each match tells you why it matched.',
    visual: <SortVisual />,
  },
  {
    number: '03',
    title: 'You join the conversation',
    body: 'Open the post and answer like a person, not an ad. Every reply carries a tracked link, so the ones that actually bring people back are the ones you can see.',
    visual: <ReplyVisual />,
  },
  {
    number: '04',
    title: 'You see what worked',
    body: 'Every reply carries a tracked link, so clicks come back tagged with the platform they came from. You learn which conversations sent people to your site, and which channel is worth your next hour.',
    visual: <ResultVisual />,
  },
];

export default function Stats() {
  const stepsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stepsRef,
    offset: ['start 65%', 'end 60%'],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <section className="relative w-full pt-8 pb-24">
      <Container className="relative z-10 mx-auto">
        <div id="how-it-works" className="mb-16 flex flex-col items-center text-center">
          <Heading
            as="h2"
            variant="big"
            className="text-foreground font-sans font-semibold text-balance lg:text-[48px]"
          >
            Four steps, once a day
          </Heading>
        </div>

        {/* Progress rail fills as you scroll through the steps */}
        <div ref={stepsRef} className="relative mx-auto max-w-6xl">
          <div className="absolute top-0 bottom-0 left-0 hidden w-px bg-white/10 lg:block">
            <motion.div
              className="bg-primary absolute top-0 left-0 w-px origin-top"
              style={{ height: '100%', scaleY: progress }}
            />
          </div>

          <div className="flex flex-col gap-32 lg:pl-16">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
              >
                <div>
                  <p className="font-mono text-5xl font-semibold text-white/15">
                    {step.number}
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-white/50">
                    {step.body}
                  </p>
                  {step.marks ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {PLATFORM_MARKS.map((mark) => (
                        <span
                          key={mark.label}
                          title={mark.label}
                          className="flex h-8 w-8 items-center justify-center"
                          style={{ backgroundColor: mark.bg }}
                        >
                          <mark.Icon
                            className="h-4 w-4"
                            style={{ color: mark.fg }}
                          />
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div>{step.visual}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
