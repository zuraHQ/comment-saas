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

          {/* The internet: unfiltered noise */}
          <div
            className="relative h-[26rem] w-full"
            style={{ gridColumn: 1, gridRow: 2 }}
          >
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
