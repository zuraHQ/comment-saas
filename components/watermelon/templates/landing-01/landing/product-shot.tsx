import { Check, Copy, X } from 'lucide-react';
import { FaHackerNews, FaRedditAlien, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import Container from './container';

const RAIL = [
  { label: 'Reddit', Icon: FaRedditAlien, bg: '#FF4500', fg: '#ffffff', count: '412 posts', active: true },
  { label: 'Hacker News', Icon: FaHackerNews, bg: '#FF6600', fg: '#ffffff', count: '96 posts' },
  { label: 'X / Twitter', Icon: FaXTwitter, bg: '#ffffff', fg: '#000000', count: '188 posts' },
  { label: 'YouTube', Icon: FaYoutube, bg: '#FF0000', fg: '#ffffff', count: '54 posts' },
];

const CARDS = [
  {
    meta: 'r/freelance · u/marta_builds · 4m ago',
    intent: 'High intent',
    intentClass: 'bg-[#FF6600] text-[#101010]',
    title: 'Looking for a simple invoicing tool that is not enterprise priced',
    snippet:
      'Every option I try wants a sales call and a seat minimum. I bill six clients a month and I just want something that sends a PDF and chases the payment.',
    why: 'Asking for a tool like yours, and priced out of the alternatives.',
    reply:
      'Ran into this exact thing last year. We ended up building Acme around it, happy to share how we handle the chasing part if that helps.',
    Icon: FaRedditAlien,
    color: '#FF4500',
  },
  {
    meta: 'r/smallbusiness · u/deniz_k · 22m ago',
    intent: 'Medium intent',
    intentClass: 'bg-[#FFC53D] text-[#101010]',
    title: 'How do you all handle late payers without being rude about it',
    snippet:
      'Two of my clients are 30 days out and I hate sending the follow up email. Is there something that just does it on a schedule?',
    why: 'Describes the manual work you replace, and asks for a fix.',
    reply:
      'The tedious bit is doing it by hand every week. That is basically why Acme exists, though even a rough script gets you most of the way.',
    Icon: FaRedditAlien,
    color: '#FF4500',
  },
];

export default function ProductShot() {
  return (
    <section className="relative w-full py-24">
      <Container className="relative z-10 mx-auto">
        <div className="mx-auto max-w-6xl border border-white/10 bg-[#101010]">
          {/* Top bar */}
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <span className="flex h-6 w-6 items-center justify-center bg-[#A3FF12] font-mono text-[10px] font-bold text-[#101010]">
              A
            </span>
            <span className="text-sm font-medium text-white">Acme</span>
            <span className="ml-auto font-mono text-[10px] tracking-widest text-white/30 uppercase">
              750 posts · 41 high intent
            </span>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Platform rail */}
            <div className="flex shrink-0 overflow-hidden border-b border-white/10 lg:w-56 lg:flex-col lg:border-r lg:border-b-0">
              {RAIL.map((item) => (
                <div
                  key={item.label}
                  className={`flex shrink-0 items-center gap-3 px-4 py-3 ${
                    item.active ? 'bg-white/[0.06]' : ''
                  }`}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center"
                    style={{ backgroundColor: item.bg }}
                  >
                    <item.Icon className="h-4 w-4" style={{ color: item.fg }} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium text-white">
                      {item.label}
                    </span>
                    <span className="truncate text-xs text-white/40">
                      {item.count}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            {/* Feed */}
            <div className="grid min-w-0 flex-1 gap-3 p-3 xl:grid-cols-2">
              {CARDS.map((card) => (
                <div
                  key={card.title}
                  className="flex flex-col border border-white/10 bg-white/[0.03]"
                >
                  <div className="flex items-center justify-between gap-3 bg-white/[0.04] px-4 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <card.Icon
                        className="size-4 shrink-0"
                        style={{ color: card.color }}
                      />
                      <span className="truncate text-xs text-white/40">
                        {card.meta}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${card.intentClass}`}
                    >
                      {card.intent}
                    </span>
                  </div>

                  <div className="flex-1 p-4">
                    <p className="text-sm font-medium text-white">
                      {card.title}
                    </p>
                    <p className="mt-2 text-sm text-white/50">{card.snippet}</p>
                    <p className="mt-2 text-xs text-white/35">
                      Why: {card.why}
                    </p>
                    <p className="mt-4 border border-white/10 bg-[#101010] p-3 text-sm text-white/70">
                      {card.reply}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-white/10 px-4 py-3">
                    <span className="flex h-9 w-9 items-center justify-center border border-white/10 text-white/25">
                      <Copy className="h-4 w-4" />
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center border border-white/10 text-white/25">
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center border border-white/10 text-white/25">
                      <X className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
