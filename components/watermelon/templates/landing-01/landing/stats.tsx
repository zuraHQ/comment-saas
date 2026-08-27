import {
  FaBluesky,
  FaHackerNews,
  FaInstagram,
  FaRedditAlien,
  FaXTwitter,
} from 'react-icons/fa6';
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
    <div className="relative flex h-80 items-center justify-center overflow-hidden border border-white/10 bg-white/[0.02]">
      {/* Radar rings */}
      <div className="absolute flex h-72 w-72 items-center justify-center rounded-full border border-white/10">
        <div className="flex h-48 w-48 items-center justify-center rounded-full border border-white/10">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-primary/40">
            <Globe className="text-primary h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Chatter picked up around the edges */}
      <div className="relative z-10 flex w-full flex-col gap-2 px-6">
        {CHATTER.slice(0, 4).map((item, i) => (
          <span
            key={item.text}
            className={cn(
              'flex items-center gap-2 border border-white/10 bg-background/80 px-3 py-1.5 text-xs text-white/60 backdrop-blur-sm',
              i % 2 === 0 ? 'mr-auto' : 'ml-auto',
            )}
          >
            <item.Icon
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: item.color }}
            />
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- 02 */
const SORTED = [
  { text: 'Looking for a simple invoicing tool for freelancers', intent: 'High', keep: true },
  { text: 'spreadsheets are killing me, any automation?', intent: 'High', keep: true },
  { text: 'has anyone tried Notion for CRM?', intent: 'Medium', keep: true },
  { text: 'just launched v2 today', intent: 'Low', keep: false },
  { text: 'good morning everyone', intent: 'Low', keep: false },
];

function SortVisual() {
  return (
    <div className="flex h-80 flex-col justify-center gap-2 border border-white/10 bg-white/[0.02] p-6">
      {SORTED.map((row) => (
        <div
          key={row.text}
          className={cn(
            'flex items-center gap-3 border px-3 py-2.5 text-xs',
            row.keep
              ? 'border-white/10 bg-white/[0.03] text-white/80'
              : 'border-white/5 text-white/25 line-through',
          )}
        >
          <span className="min-w-0 flex-1 truncate">{row.text}</span>
          <span
            className={cn(
              'shrink-0 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase',
              row.intent === 'High'
                ? 'bg-[#FF6600] text-[#101010]'
                : row.intent === 'Medium'
                  ? 'bg-[#FFC53D] text-[#101010]'
                  : 'bg-white/10 text-white/40',
            )}
          >
            {row.intent}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- 03 */
function ReplyVisual() {
  return (
    <div className="flex h-80 flex-col justify-center gap-4 border border-white/10 bg-white/[0.02] p-6">
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
