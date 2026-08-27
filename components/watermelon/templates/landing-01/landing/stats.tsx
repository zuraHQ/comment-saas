import {
  FaBluesky,
  FaHackerNews,
  FaInstagram,
  FaRedditAlien,
  FaXTwitter,
} from 'react-icons/fa6';
import { Globe } from 'lucide-react';
import Container from './container';
import Heading from './heading';

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


function ColumnLabel({ title, body }: { title: string; body: string }) {
  return (
    <div>
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
      <Container className="relative z-10 mx-auto max-w-[104rem]">
        <div id="how-it-works" className="mb-14 flex flex-col items-center text-center">
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

        {/* Two rows so the connecting web can span all three columns */}
        <div className="grid gap-x-6 gap-y-10 lg:grid-cols-[1fr_14rem_1fr] lg:grid-rows-[auto_26rem]">
          <ColumnLabel
            title="The internet"
            body="Millions of conversations happening right now"
          />
          <ColumnLabel
            title="We find intent"
            body="AI filters the noise and detects high-intent conversations"
          />
          <ColumnLabel
            title="Customer opportunities"
            body="High-intent posts, ready for you to reply"
          />

          {/* The web: left lines gather the noise, right lines feed the cards */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
            className="pointer-events-none hidden h-full w-full lg:block"
            style={{ gridColumn: "1 / -1", gridRow: 2 }}
          >
            {Array.from({ length: 16 }, (_, i) => {
              const y = 4 + i * 6.2;
              return (
                <path
                  key={`in-${i}`}
                  d={`M2 ${y} C 30 ${y}, 40 50, 47 50`}
                  className="stroke-white/10"
                  fill="none"
                  strokeWidth="0.15"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            {[15, 38, 62, 85].map((y, i) => (
              <path
                key={`out-${i}`}
                d={`M53 50 C 62 50, 70 ${y}, 98 ${y}`}
                className="stroke-primary/40"
                fill="none"
                strokeWidth="0.15"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {/* The internet: unfiltered noise */}
          <div
            className="relative h-[26rem] w-full"
            style={{ gridColumn: 1, gridRow: 2 }}
          >
            {NOISE.map((item) => (
              <span
                key={item.text}
                className="absolute max-w-[70%] truncate text-xs text-white/25"
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

          {/* The hub, dead centre of the web */}
          <div
            className="flex h-[26rem] items-center justify-center"
            style={{ gridColumn: 2, gridRow: 2 }}
          >
            <span className="border-primary/60 bg-background relative flex h-16 w-16 items-center justify-center border">
              <Globe className="text-primary h-6 w-6" />
            </span>
          </div>

          {/* Opportunities: fixed heights so the lines meet each card */}
          <ul
            className="flex h-[26rem] flex-col justify-center gap-2"
            style={{ gridColumn: 3, gridRow: 2 }}
          >
            {OPPORTUNITIES.map((item) => (
              <li
                key={item.quote}
                className="flex h-[5.5rem] items-center gap-3 border border-white/10 bg-white/[0.02] p-3 backdrop-blur-sm"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center"
                  style={{ backgroundColor: item.bg }}
                >
                  <item.Icon className="h-4 w-4" style={{ color: item.fg }} />
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

      </Container>
    </section>
  );
}
