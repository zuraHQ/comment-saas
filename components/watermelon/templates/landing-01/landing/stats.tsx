import {
  FaBluesky,
  FaHackerNews,
  FaInstagram,
  FaRedditAlien,
  FaXTwitter,
} from 'react-icons/fa6';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Globe } from 'lucide-react';
import Container from './container';
import Heading from './heading';
import { cn } from '@/lib/utils';

/* ---------------------------------------------------------------- 01 */
// Raw chatter arriving from every platform at once.
const CHATTER = [
  { text: 'anyone know a good invoicing tool?', Icon: FaRedditAlien, color: '#FF4500' },
  { text: 'just launched v2 today', Icon: FaXTwitter, color: '#ffffff' },
  { text: "what's the best way to track leads?", Icon: FaBluesky, color: '#0085FF' },
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
const SORTED = [
  {
    text: 'Looking for a simple invoicing tool for freelancers',
    Icon: FaRedditAlien,
    color: '#FF4500',
    intent: 'High',
  },
  {
    text: 'spreadsheets are killing me, any automation?',
    Icon: FaBluesky,
    color: '#0085FF',
    intent: 'High',
  },
  {
    text: 'has anyone tried Notion for CRM?',
    Icon: FaHackerNews,
    color: '#FF6600',
    intent: 'Medium',
  },
  {
    text: 'just launched v2 today',
    Icon: FaXTwitter,
    color: '#ffffff',
    intent: 'Low',
  },
  {
    text: 'good morning everyone',
    Icon: FaInstagram,
    color: '#E4405F',
    intent: 'Low',
  },
];

const INTENT_CHIP: Record<string, string> = {
  High: 'bg-[#FF6600] text-[#101010]',
  Medium: 'bg-[#FFC53D] text-[#101010]',
  Low: 'bg-white/10 text-white/40',
};

// Rows get scored one by one, then the low-intent ones fade out of the feed.
function SortVisual() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setStep((s) => (s + 1) % (SORTED.length + 2)),
      900,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-80 flex-col justify-center gap-2">
      {SORTED.map((row, i) => {
        const scored = step > i;
        const dropped = step >= SORTED.length + 1 && row.intent === 'Low';
        return (
          <motion.div
            key={row.text}
            animate={{
              opacity: dropped ? 0.15 : scored ? 1 : 0.45,
              x: dropped ? -12 : 0,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={cn(
              'flex items-center gap-3 border px-3 py-2.5 text-xs',
              scored && !dropped
                ? 'border-white/15 bg-white/[0.04] text-white/80'
                : 'border-white/5 text-white/40',
            )}
          >
            <row.Icon
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: row.color }}
            />
            <span className="min-w-0 flex-1 truncate">{row.text}</span>
            <AnimatePresence mode="wait">
              {scored ? (
                <motion.span
                  key="chip"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    'shrink-0 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase',
                    INTENT_CHIP[row.intent],
                  )}
                >
                  {row.intent}
                </motion.span>
              ) : (
                <motion.span
                  key="scoring"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="shrink-0 border border-white/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-white/30 uppercase"
                >
                  Scoring
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- 03 */
function ReplyVisual() {
  return (
    <div className="flex h-80 flex-col justify-center gap-4">
      <div className="border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center bg-[#FF4500]">
            <FaRedditAlien className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-xs text-white/40">r/smallbusiness · 4m ago</span>
          <span className="ml-auto bg-[#FF6600] px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-[#101010] uppercase">
            High
          </span>
        </div>
        <p className="mt-3 text-sm text-white/80">
          &ldquo;Looking for a simple invoicing tool for freelancers. Everything
          I try wants a monthly enterprise plan.&rdquo;
        </p>
      </div>

      <div className="border border-primary/40 bg-primary/[0.06] p-4">
        <p className="font-mono text-[10px] font-bold tracking-widest text-primary uppercase">
          Your reply
        </p>
        <p className="mt-2 text-sm text-white/70">
          I built something for exactly this after the same problem. Free tier
          covers what you described.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-white/40">
        <Check className="text-primary h-4 w-4" />
        14 clicks tracked from this reply
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- 04 */
const CLICK_SOURCES = [
  { label: 'Reddit', Icon: FaRedditAlien, color: '#FF4500', clicks: 84 },
  { label: 'Hacker News', Icon: FaHackerNews, color: '#FF6600', clicks: 51 },
  { label: 'Bluesky', Icon: FaBluesky, color: '#0085FF', clicks: 33 },
  { label: 'X', Icon: FaXTwitter, color: '#ffffff', clicks: 18 },
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
            className="text-primary text-4xl font-semibold"
            initial={{ opacity: 0.4 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {total}
          </motion.p>
        </div>
        <div>
          <p className="font-mono text-[10px] font-bold tracking-widest text-white/40 uppercase">
            Replies sent
          </p>
          <p className="text-4xl font-semibold text-white">27</p>
        </div>
        <div>
          <p className="font-mono text-[10px] font-bold tracking-widest text-white/40 uppercase">
            Best channel
          </p>
          <p className="text-4xl font-semibold text-white">Reddit</p>
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
            <span className="relative h-3 flex-1 bg-white/5">
              <motion.span
                className="bg-primary absolute inset-y-0 left-0"
                initial={{ width: 0 }}
                whileInView={{ width: `${(source.clicks / max) * 100}%` }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: 'easeOut' }}
              />
            </span>
            <span className="w-10 shrink-0 text-right text-xs tabular-nums text-white/60">
              {source.clicks}
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
    number: '01',
    title: 'We read the internet',
    body: 'Reddit, X, Hacker News, Bluesky, Instagram, TikTok, LinkedIn, GitHub and YouTube. Whole communities read end to end, not just keyword hits, so nothing relevant slips past.',
    visual: <ScanVisual />,
  },
  {
    number: '02',
    title: 'AI sorts the noise',
    body: 'Every post is scored against what your product actually does. High intent rises to the top, the rest never reaches your feed, and each match tells you why it matched.',
    visual: <SortVisual />,
  },
  {
    number: '03',
    title: 'You reply first',
    body: 'Open the post, answer like a human, and drop your tracked link. Clicks come back with the platform they came from, so you learn which conversations turn into customers.',
    visual: <ReplyVisual />,
  },
  {
    number: '04',
    title: 'You get customers',
    body: 'Every reply carries a tracked link, so clicks come back tagged with the platform they came from. You see which conversations turned into visitors, and which channel is worth your next hour.',
    visual: <ResultVisual />,
  },
];

export default function Stats() {
  return (
    <section className="relative w-full py-24">
      <Container className="relative z-10 mx-auto">
        <div id="how-it-works" className="mb-16 flex flex-col items-center text-center">
          <p className="text-primary mb-6 inline-flex items-center font-mono text-xs font-bold tracking-widest uppercase">
            <span className="mr-3 opacity-70">{'//'}</span>
            How it works
          </p>
          <Heading
            as="h2"
            variant="big"
            className="text-foreground font-sans font-semibold text-balance lg:text-[48px]"
          >
            Noise in. Customers out.
          </Heading>
        </div>

        <div className="mx-auto flex max-w-6xl flex-col gap-20">
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
              </div>
              <div>{step.visual}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
