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

const SWEEP_SECONDS = 5;

// Blips sit on the ring; each flashes as the sweep angle reaches it.
const BLIPS = [{"angle": 25, "left": 62.68, "top": 22.81}, {"angle": 115, "left": 77.19, "top": 62.68}, {"angle": 205, "left": 37.32, "top": 77.19}, {"angle": 295, "left": 22.81, "top": 37.32}];

function ScanVisual() {
  const [active, setActive] = useState(0);

  // Advance the surfaced comment in step with the sweep passing each blip.
  useEffect(() => {
    const timer = setInterval(
      () => setActive((i) => (i + 1) % BLIPS.length),
      (SWEEP_SECONDS * 1000) / BLIPS.length,
    );
    return () => clearInterval(timer);
  }, []);

  const item = CHATTER[active % CHATTER.length];

  return (
    <div className="relative flex h-80 items-center justify-center overflow-hidden">
      <div className="relative flex h-72 w-72 items-center justify-center rounded-full border border-white/10">
        {/* Sweep */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, rgba(163,255,18,0.28), rgba(163,255,18,0) 30%)',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: SWEEP_SECONDS,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Rings */}
        <div className="flex h-48 w-48 items-center justify-center rounded-full border border-white/10">
          <div className="bg-background flex h-24 w-24 items-center justify-center rounded-full border border-white/15">
            <Globe className="h-6 w-6 text-white/60" strokeWidth={1.25} />
          </div>
        </div>

        {/* Contacts on the ring */}
        {BLIPS.map((blip, i) => (
          <motion.span
            key={blip.angle}
            className="bg-primary absolute h-2 w-2 rounded-full"
            style={{
              left: `${blip.left}%`,
              top: `${blip.top}%`,
              marginLeft: -4,
              marginTop: -4,
            }}
            animate={{ opacity: [0.15, 1, 0.15], scale: [1, 1.6, 1] }}
            transition={{
              duration: SWEEP_SECONDS,
              times: [0, 0.06, 0.5],
              repeat: Infinity,
              delay: (blip.angle / 360) * SWEEP_SECONDS,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* What the sweep just picked up */}
      <div className="absolute bottom-2 left-0 flex w-full justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.span
            key={item.text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-background/90 flex items-center gap-2 border border-white/10 px-3 py-1.5 text-xs whitespace-nowrap text-white/70 backdrop-blur-sm"
          >
            <item.Icon
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: item.color }}
            />
            {item.text}
          </motion.span>
        </AnimatePresence>
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
