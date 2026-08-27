'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, X } from 'lucide-react';
import {
  FaHackerNews,
  FaLinkedinIn,
  FaRedditAlien,
  FaXTwitter,
} from 'react-icons/fa6';

const RAIL = [
  { label: 'Reddit', Icon: FaRedditAlien, bg: '#FF4500', fg: '#ffffff', base: 412 },
  { label: 'Hacker News', Icon: FaHackerNews, bg: '#FF6600', fg: '#ffffff', base: 96 },
  { label: 'X / Twitter', Icon: FaXTwitter, bg: '#ffffff', fg: '#000000', base: 188 },
  { label: 'LinkedIn', Icon: FaLinkedinIn, bg: '#0A66C2', fg: '#ffffff', base: 54 },
];

const FEED = [
  {
    id: 'invoicing',
    meta: 'r/freelance · u/marta_builds · just now',
    intent: 'High',
    title: 'Looking for a simple invoicing tool that is not enterprise priced',
    snippet:
      'Every option wants a sales call and a seat minimum. I bill six clients a month.',
    reply:
      'Ran into this exact thing last year. Happy to share how we handle the chasing part if that helps.',
    Icon: FaRedditAlien,
    color: '#FF4500',
  },
  {
    id: 'latepayers',
    meta: 'r/smallbusiness · u/deniz_k · just now',
    intent: 'Medium',
    title: 'How do you handle late payers without being rude about it',
    snippet:
      'Two clients are 30 days out and I hate sending the follow up email every week.',
    reply:
      'The tedious bit is doing it by hand. A reminder on a schedule fixed most of it for us.',
    Icon: FaRedditAlien,
    color: '#FF4500',
  },
  {
    id: 'spreadsheets',
    meta: 'LinkedIn · Priya S. · just now',
    intent: 'High',
    title: 'Our finance ops still run on three spreadsheets. Open to recommendations.',
    snippet:
      'Month end takes two days and something always slips through the cracks.',
    reply:
      'We were on four of them. Worth mapping which parts are actually repeat work first.',
    Icon: FaLinkedinIn,
    color: '#0A66C2',
  },
  {
    id: 'notion-crm',
    meta: 'Hacker News · tomasz · just now',
    intent: 'Medium',
    title: 'Has anyone run a CRM out of Notion long term?',
    snippet: 'Curious how it holds up once you pass a few hundred contacts.',
    reply:
      'It held up to about 300 for us, then the manual upkeep got worse than the tool.',
    Icon: FaHackerNews,
    color: '#FF6600',
  },
];

const INTENT: Record<string, string> = {
  High: 'bg-[#FF6600] text-[#101010]',
  Medium: 'bg-[#FFC53D] text-[#101010]',
};

const ARRIVE_MS = 2600;
const SCORE_MS = 900;

function Card({ post }: { post: (typeof FEED)[number] }) {
  // Each card lands unscored, then the verdict and the draft appear.
  const [scored, setScored] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setScored(true), SCORE_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="border border-white/10 bg-white/[0.03]"
    >
      <div className="flex items-center justify-between gap-3 bg-white/[0.04] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <post.Icon className="size-3 shrink-0" style={{ color: post.color }} />
          <span className="truncate text-[10px] text-white/40">{post.meta}</span>
        </div>
        {scored ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`shrink-0 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase ${INTENT[post.intent]}`}
          >
            {post.intent} intent
          </motion.span>
        ) : (
          <span className="shrink-0 font-mono text-[9px] tracking-wider text-white/25 uppercase">
            Scoring...
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="truncate text-[11px] font-medium text-white">
          {post.title}
        </p>
        <p className="mt-1 truncate text-[10px] text-white/45">
          {post.snippet}
        </p>
        <div className="mt-2 h-[34px]">
          {scored ? (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="line-clamp-2 border border-white/10 bg-[#101010] p-2 text-[10px] text-white/60"
            >
              {post.reply}
            </motion.p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 border-t border-white/10 px-3 py-2">
        {[Copy, Check, X].map((Icon, i) => (
          <span
            key={i}
            className="flex h-6 w-6 items-center justify-center border border-white/10 text-white/25"
          >
            <Icon className="h-3 w-3" />
          </span>
        ))}
      </div>
    </motion.li>
  );
}

export default function HeroDemo() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => setCount((c) => c + 1), ARRIVE_MS);
    return () => clearInterval(timer);
  }, []);

  // Newest first, three on screen. The key carries the pass number so a post
  // coming round again animates in as a fresh arrival.
  const visible = Array.from({ length: 3 }, (_, i) => {
    const n = count - 1 - i;
    return n < 0 ? null : { post: FEED[n % FEED.length], key: `${n}` };
  }).filter(Boolean) as Array<{ post: (typeof FEED)[number]; key: string }>;

  return (
    <div className="flex h-full w-full text-left">
      {/* Platform rail */}
      <div className="hidden w-44 shrink-0 flex-col border-r border-white/10 sm:flex">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
          <span className="flex h-5 w-5 items-center justify-center bg-[#A3FF12] font-mono text-[9px] font-bold text-[#101010]">
            A
          </span>
          <span className="text-[11px] font-medium text-white">Acme</span>
        </div>
        {RAIL.map((item, i) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 px-3 py-2.5 ${i === 0 ? 'bg-white/[0.06]' : ''}`}
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center"
              style={{ backgroundColor: item.bg }}
            >
              <item.Icon className="h-3 w-3" style={{ color: item.fg }} />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[11px] font-medium text-white">
                {item.label}
              </span>
              <span className="font-mono text-[9px] text-white/30 tabular-nums">
                {item.base + (i === 0 ? count : 0)} posts
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* Feed */}
      <ul className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden p-3">
        <AnimatePresence initial={false}>
          {visible.map(({ post, key }) => (
            <Card key={key} post={post} />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
