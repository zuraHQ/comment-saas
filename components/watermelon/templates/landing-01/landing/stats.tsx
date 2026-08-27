import {
  FaBluesky,
  FaHackerNews,
  FaInstagram,
  FaRedditAlien,
  FaXTwitter,
} from 'react-icons/fa6';
import { Globe, Radar, Filter, Zap, Users } from 'lucide-react';
import Container from './container';
import { cn } from '@/lib/utils';

// Raw chatter on the left: what the internet looks like before filtering.
const NOISE = [
  { text: 'just launched v2 today...', x: 12, y: 12 },
  { text: 'anyone know a good...', x: 48, y: 8 },
  { text: "what's the best way to...", x: 55, y: 22 },
  { text: 'looking for a tool that...', x: 4, y: 30 },
  { text: 'need a better solution for...', x: 40, y: 33 },
  { text: 'I wish there was...', x: 14, y: 42 },
  { text: 'has anyone tried...', x: 52, y: 45 },
  { text: 'recommend me a service that...', x: 2, y: 55 },
  { text: 'alternatives to...', x: 26, y: 62 },
  { text: 'looking to automate...', x: 34, y: 72 },
  { text: 'trying for something...', x: 8, y: 80 },
  { text: 'why is it so hard to...', x: 42, y: 84 },
  { text: 'what do you guys use for...', x: 22, y: 92 },
];

const NOISE_MARKS = [
  { Icon: FaXTwitter, color: '#ffffff', x: 30, y: 18 },
  { Icon: FaRedditAlien, color: '#FF4500', x: 33, y: 50 },
  { Icon: FaBluesky, color: '#0085FF', x: 62, y: 40 },
  { Icon: FaInstagram, color: '#E4405F', x: 52, y: 66 },
  { Icon: FaHackerNews, color: '#FF6600', x: 8, y: 68 },
];

const OPPORTUNITIES = [
  {
    quote: 'I wish there was a better way to track my habits with friends.',
    Icon: FaBluesky,
    bg: '#0085FF',
    fg: '#ffffff',
    source: 'Bluesky',
    time: '2m ago',
    intent: 98,
  },
  {
    quote: 'Any tool that helps me summarize long YouTube videos?',
    Icon: FaXTwitter,
    bg: '#ffffff',
    fg: '#000000',
    source: 'X (Twitter)',
    time: '5m ago',
    intent: 96,
  },
  {
    quote: 'Looking for a simple invoicing tool for freelancers.',
    Icon: FaRedditAlien,
    bg: '#FF4500',
    fg: '#ffffff',
    source: 'Reddit',
    time: '12m ago',
    intent: 94,
  },
  {
    quote: "Open source alternative to Linear that's actually fast?",
    Icon: FaHackerNews,
    bg: '#FF6600',
    fg: '#ffffff',
    source: 'Hacker News',
    time: '18m ago',
    intent: 93,
  },
];

const STEPS = [
  {
    Icon: Radar,
    title: '1. We scan',
    body: '24/7 monitoring millions of conversations across the web.',
  },
  {
    Icon: Filter,
    title: '2. We find intent',
    body: 'AI detects people actively looking for solutions.',
  },
  {
    Icon: Zap,
    title: '3. You reply first',
    body: 'Be the first to respond and start the conversation.',
  },
  {
    Icon: Users,
    title: '4. You get customers',
    body: 'Turn conversations into loyal paying customers.',
  },
];

function ColumnLabel({ title, body }: { title: string; body: string }) {
  return (
    <div className="mb-6">
      <p className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-white uppercase">
        <span className="bg-primary h-1.5 w-1.5" />
        {title}
      </p>
      <p className="mt-2 text-sm text-white/50">{body}</p>
    </div>
  );
}

export default function Stats() {
  return (
    <section className="relative w-full overflow-hidden py-24">
      <Container className="relative z-10 mx-auto">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
          {/* The internet: unfiltered noise */}
          <div>
            <ColumnLabel
              title="The internet"
              body="Millions of conversations happening right now"
            />
            <div className="relative h-[26rem] w-full">
              {NOISE.map((item) => (
                <span
                  key={item.text}
                  className="absolute max-w-[60%] truncate text-xs text-white/25"
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                >
                  {item.text}
                </span>
              ))}
              {NOISE_MARKS.map((mark, i) => (
                <mark.Icon
                  key={i}
                  className="absolute h-4 w-4 opacity-40"
                  style={{
                    left: `${mark.x}%`,
                    top: `${mark.y}%`,
                    color: mark.color,
                  }}
                />
              ))}
            </div>
          </div>

          {/* The filter */}
          <div className="flex flex-col items-center">
            <ColumnLabel
              title="We find intent"
              body="AI filters the noise and detects high-intent conversations"
            />
            <div className="relative flex h-[26rem] w-full items-center justify-center lg:w-56">
              {/* Converging lines, left to centre and centre to right */}
              <svg
                viewBox="0 0 224 416"
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
                aria-hidden
              >
                {Array.from({ length: 14 }, (_, i) => {
                  const y = 24 + i * 28;
                  return (
                    <path
                      key={`in-${i}`}
                      d={`M0 ${y} C 70 ${y}, 80 208, 104 208`}
                      className="stroke-white/10"
                      fill="none"
                      strokeWidth="1"
                    />
                  );
                })}
                {Array.from({ length: 5 }, (_, i) => {
                  const y = 80 + i * 64;
                  return (
                    <path
                      key={`out-${i}`}
                      d={`M120 208 C 150 208, 170 ${y}, 224 ${y}`}
                      className="stroke-primary/50"
                      fill="none"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>

              {/* Hub */}
              <span className="border-primary/60 bg-background relative flex h-16 w-16 items-center justify-center border">
                <Globe className="text-primary h-6 w-6" />
              </span>
            </div>
          </div>

          {/* Opportunities */}
          <div>
            <ColumnLabel
              title="Customer opportunities"
              body="High-intent posts, ready for you to reply"
            />
            <ul className="flex flex-col gap-2">
              {OPPORTUNITIES.map((item) => (
                <li
                  key={item.quote}
                  className="flex items-center gap-3 border border-white/10 bg-white/[0.02] p-3"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center"
                    style={{ backgroundColor: item.bg }}
                  >
                    <item.Icon
                      className="h-4 w-4"
                      style={{ color: item.fg }}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm text-white/90">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {item.source} &middot; {item.time}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-[10px] tracking-widest text-white/40 uppercase">
                      Intent
                    </p>
                    <p className="text-primary text-lg font-semibold">
                      {item.intent}%
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* How it works */}
        <div
          id="how-it-works"
          className="mt-16 grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STEPS.map((step) => (
            <div key={step.title} className="flex items-start gap-4">
              <step.Icon
                className={cn('text-primary h-8 w-8 shrink-0')}
                strokeWidth={1.25}
              />
              <div>
                <p className="text-base font-semibold text-white">
                  {step.title}
                </p>
                <p className="mt-1 text-sm text-white/50">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
