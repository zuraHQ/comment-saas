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
const PIXELS = [{"x": 31.7, "y": 14.8, "s": 2, "o": 0.04}, {"x": 80.5, "y": 9.2, "s": 2, "o": 0.06}, {"x": 3.7, "y": 42.5, "s": 2, "o": 0.06}, {"x": 8.9, "y": 41.6, "s": 2, "o": 0.06}, {"x": 61.8, "y": 57.1, "s": 2, "o": 0.13}, {"x": 4.9, "y": 21.7, "s": 2, "o": 0.09}, {"x": 41.1, "y": 53.0, "s": 3, "o": 0.06}, {"x": 10.1, "y": 56.0, "s": 2, "o": 0.09}, {"x": 9.5, "y": 69.8, "s": 2, "o": 0.06}, {"x": 48.6, "y": 52.1, "s": 3, "o": 0.13}, {"x": 57.4, "y": 44.4, "s": 3, "o": 0.06}, {"x": 77.8, "y": 68.5, "s": 2, "o": 0.04}, {"x": 56.3, "y": 51.5, "s": 3, "o": 0.13}, {"x": 28.2, "y": 96.1, "s": 2, "o": 0.13}, {"x": 16.2, "y": 33.5, "s": 4, "o": 0.13}, {"x": 3.8, "y": 65.5, "s": 3, "o": 0.09}, {"x": 68.1, "y": 58.2, "s": 4, "o": 0.04}, {"x": 82.3, "y": 92.6, "s": 4, "o": 0.04}, {"x": 5.9, "y": 68.7, "s": 4, "o": 0.09}, {"x": 70.2, "y": 86.9, "s": 3, "o": 0.04}, {"x": 92.2, "y": 34.8, "s": 2, "o": 0.13}, {"x": 5.8, "y": 75.3, "s": 2, "o": 0.06}, {"x": 39.0, "y": 89.8, "s": 4, "o": 0.04}, {"x": 16.3, "y": 39.4, "s": 3, "o": 0.06}, {"x": 80.3, "y": 84.7, "s": 3, "o": 0.13}, {"x": 96.7, "y": 66.9, "s": 4, "o": 0.06}, {"x": 14.8, "y": 17.3, "s": 2, "o": 0.06}, {"x": 1.2, "y": 81.4, "s": 2, "o": 0.09}, {"x": 27.6, "y": 14.3, "s": 3, "o": 0.09}, {"x": 93.4, "y": 67.7, "s": 2, "o": 0.13}, {"x": 88.2, "y": 76.4, "s": 4, "o": 0.13}, {"x": 39.1, "y": 10.1, "s": 4, "o": 0.04}, {"x": 18.7, "y": 96.5, "s": 4, "o": 0.06}, {"x": 10.8, "y": 58.9, "s": 2, "o": 0.04}, {"x": 55.5, "y": 52.6, "s": 3, "o": 0.04}, {"x": 6.9, "y": 20.4, "s": 4, "o": 0.06}, {"x": 62.2, "y": 93.6, "s": 3, "o": 0.13}, {"x": 12.0, "y": 83.2, "s": 4, "o": 0.13}, {"x": 47.4, "y": 8.4, "s": 2, "o": 0.09}, {"x": 72.6, "y": 46.9, "s": 2, "o": 0.04}, {"x": 20.1, "y": 93.3, "s": 3, "o": 0.06}, {"x": 67.6, "y": 89.6, "s": 3, "o": 0.04}, {"x": 68.2, "y": 25.6, "s": 3, "o": 0.06}, {"x": 34.9, "y": 21.8, "s": 3, "o": 0.06}, {"x": 60.1, "y": 77.3, "s": 2, "o": 0.06}, {"x": 80.2, "y": 72.5, "s": 2, "o": 0.06}, {"x": 50.7, "y": 34.8, "s": 2, "o": 0.04}, {"x": 77.4, "y": 46.3, "s": 2, "o": 0.09}, {"x": 43.8, "y": 91.8, "s": 3, "o": 0.09}, {"x": 7.9, "y": 10.0, "s": 4, "o": 0.06}, {"x": 33.1, "y": 47.3, "s": 2, "o": 0.13}, {"x": 89.1, "y": 33.7, "s": 2, "o": 0.04}, {"x": 89.2, "y": 76.7, "s": 2, "o": 0.13}, {"x": 87.1, "y": 42.5, "s": 3, "o": 0.04}, {"x": 78.5, "y": 95.2, "s": 4, "o": 0.13}, {"x": 39.3, "y": 92.8, "s": 2, "o": 0.06}, {"x": 97.3, "y": 2.7, "s": 4, "o": 0.06}, {"x": 59.9, "y": 58.4, "s": 4, "o": 0.09}, {"x": 15.3, "y": 53.7, "s": 2, "o": 0.04}, {"x": 78.3, "y": 71.2, "s": 2, "o": 0.06}, {"x": 42.5, "y": 85.4, "s": 2, "o": 0.04}, {"x": 24.7, "y": 28.7, "s": 2, "o": 0.09}, {"x": 25.4, "y": 41.1, "s": 2, "o": 0.04}, {"x": 89.2, "y": 34.7, "s": 4, "o": 0.13}, {"x": 81.1, "y": 86.1, "s": 2, "o": 0.06}, {"x": 51.3, "y": 1.8, "s": 4, "o": 0.06}, {"x": 59.6, "y": 76.1, "s": 2, "o": 0.06}, {"x": 13.9, "y": 60.7, "s": 2, "o": 0.04}, {"x": 31.9, "y": 50.8, "s": 4, "o": 0.04}, {"x": 86.6, "y": 5.6, "s": 2, "o": 0.09}, {"x": 4.1, "y": 9.6, "s": 4, "o": 0.04}, {"x": 74.5, "y": 89.4, "s": 4, "o": 0.09}, {"x": 60.0, "y": 49.5, "s": 2, "o": 0.09}, {"x": 44.3, "y": 52.3, "s": 4, "o": 0.06}, {"x": 68.5, "y": 85.9, "s": 3, "o": 0.06}, {"x": 82.3, "y": 13.4, "s": 2, "o": 0.13}, {"x": 43.3, "y": 7.1, "s": 2, "o": 0.13}, {"x": 7.2, "y": 65.6, "s": 2, "o": 0.06}, {"x": 92.1, "y": 63.1, "s": 3, "o": 0.06}, {"x": 24.8, "y": 13.5, "s": 4, "o": 0.06}, {"x": 73.2, "y": 9.2, "s": 4, "o": 0.06}, {"x": 97.0, "y": 81.6, "s": 2, "o": 0.13}, {"x": 97.4, "y": 39.6, "s": 4, "o": 0.06}, {"x": 34.9, "y": 9.0, "s": 3, "o": 0.04}, {"x": 33.1, "y": 44.9, "s": 2, "o": 0.13}, {"x": 32.5, "y": 61.1, "s": 2, "o": 0.04}, {"x": 96.5, "y": 77.3, "s": 2, "o": 0.04}, {"x": 26.0, "y": 3.9, "s": 2, "o": 0.09}, {"x": 74.1, "y": 80.3, "s": 3, "o": 0.13}, {"x": 14.6, "y": 90.1, "s": 4, "o": 0.09}];

const NOISE = [
  { text: 'anyone know a good invoicing tool?', Icon: FaRedditAlien, color: '#FF4500', x: 2, y: 4 },
  { text: 'just launched v2 today...', Icon: FaXTwitter, color: '#ffffff', x: 44, y: 10 },
  { text: "what's the best way to track leads?", Icon: FaBluesky, color: '#0085FF', x: 8, y: 20 },
  { text: 'need a better solution for scheduling', Icon: FaInstagram, color: '#E4405F', x: 40, y: 27 },
  { text: 'I wish there was an app for this', Icon: FaRedditAlien, color: '#FF4500', x: 0, y: 36 },
  { text: 'has anyone tried Notion for CRM?', Icon: FaHackerNews, color: '#FF6600', x: 38, y: 44 },
  { text: 'recommend me a service that does...', Icon: FaXTwitter, color: '#ffffff', x: 4, y: 53 },
  { text: 'alternatives to Hubspot?', Icon: FaBluesky, color: '#0085FF', x: 42, y: 60 },
  { text: 'spreadsheets are killing me', Icon: FaRedditAlien, color: '#FF4500', x: 0, y: 69 },
  { text: 'looking to automate onboarding', Icon: FaInstagram, color: '#E4405F', x: 38, y: 76 },
  { text: 'why is it so hard to find a tool', Icon: FaHackerNews, color: '#FF6600', x: 6, y: 85 },
  { text: 'what do you guys use for support?', Icon: FaXTwitter, color: '#ffffff', x: 36, y: 93 },
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
      <Container className="relative z-10 mx-auto !max-w-none xl:px-24 2xl:px-32">
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
        <div className="grid gap-x-6 gap-y-10 lg:grid-cols-[1fr_1fr_26rem] lg:grid-rows-[auto_26rem]">
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
                  className="stroke-white/25"
                  fill="none"
                  strokeWidth="0.9"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            {[15, 38, 62, 85].map((y, i) => (
              <path
                key={`out-${i}`}
                d={`M53 50 C 62 50, 70 ${y}, 98 ${y}`}
                className="stroke-primary"
                fill="none"
                strokeWidth="0.9"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {/* The internet: unfiltered noise */}
          <div
            className="relative h-[26rem] w-full"
            style={{ gridColumn: 1, gridRow: 2 }}
          >
            {PIXELS.map((cube, i) => (
              <span
                key={`cube-${i}`}
                className="absolute bg-white"
                style={{
                  left: `${cube.x}%`,
                  top: `${cube.y}%`,
                  width: cube.s,
                  height: cube.s,
                  opacity: cube.o,
                }}
              />
            ))}
            {NOISE.map((item) => (
              <span
                key={item.text}
                className="absolute flex max-w-[58%] items-center gap-2 whitespace-nowrap"
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
              >
                <item.Icon
                  className="h-3.5 w-3.5 shrink-0 opacity-50"
                  style={{ color: item.color }}
                />
                <span className="truncate text-xs text-white/35">
                  {item.text}
                </span>
              </span>
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
