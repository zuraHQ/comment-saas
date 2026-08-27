import { FaRedditAlien } from 'react-icons/fa6';
import Container from './container';

const INPUTS = [
  {
    label: 'What they asked',
    body: 'Wants invoicing that does not need a sales call, and is tired of chasing payments by hand.',
  },
  {
    label: 'What you do',
    body: 'Read once from your site: Acme sends invoices and chases late payments on a schedule, for teams under twenty.',
  },
  {
    label: 'How you sound',
    body: 'Plain words, one mention, no pitch. The link goes in once, where it answers the question.',
  },
];

export default function AiReply() {
  return (
    <section className="relative w-full py-24">
      <Container className="relative z-10 mx-auto">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* The thread */}
          <div className="border border-white/10 bg-white/[0.02]">
            <p className="border-b border-white/10 px-5 py-3 font-mono text-[10px] tracking-widest text-white/35 uppercase">
              The comment
            </p>
            <article className="flex gap-3 p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://api.dicebear.com/9.x/notionists/svg?seed=marta&backgroundColor=1f2937"
                alt=""
                className="h-9 w-9 shrink-0 rounded-full bg-white/5"
              />
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs text-white/40">
                  <FaRedditAlien className="h-3.5 w-3.5 text-[#FF4500]" />
                  u/marta_builds · r/freelance · 4m
                </p>
                <p className="mt-2 text-sm text-white/80">
                  Looking for a simple invoicing tool for freelancers. Everything
                  I try wants an enterprise plan, and I am tired of chasing late
                  payments by hand every week.
                </p>
              </div>
            </article>

            <p className="border-y border-white/10 bg-white/[0.03] px-5 py-3 font-mono text-[10px] tracking-widest text-white/35 uppercase">
              Your draft
            </p>
            <article className="flex gap-3 p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#A3FF12] font-mono text-xs font-bold text-[#101010]">
                A
              </span>
              <div className="min-w-0">
                <p className="text-xs text-white/40">You · replying now</p>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  Been exactly here. The chasing was the part that ate my
                  Fridays, so I ended up building{' '}
                  <span className="bg-[#A3FF12]/15 px-1 font-medium text-[#A3FF12]">
                    Acme (acme.com)
                  </span>{' '}
                  around it. It sends the invoice, then follows up on a schedule
                  so you are not the one nagging. No seat minimum, and honestly
                  even a plain reminder script gets you most of the way.
                </p>
                <p className="mt-4 font-mono text-[10px] tracking-widest text-white/30 uppercase">
                  One mention · answers the question first · your words
                </p>
              </div>
            </article>
          </div>

          {/* What went into it */}
          <div className="flex flex-col gap-3">
            {INPUTS.map((input) => (
              <div
                key={input.label}
                className="border border-white/10 bg-white/[0.02] p-5"
              >
                <p className="font-mono text-[10px] tracking-widest text-white/35 uppercase">
                  {input.label}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  {input.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
