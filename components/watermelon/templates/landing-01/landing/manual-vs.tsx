import { Check, X } from 'lucide-react';
import Container from './container';
import Heading from './heading';

const MANUAL = [
  { text: 'Search nine platforms, every few hours', time: '20 – 40 min' },
  { text: 'Read every mention, judge which ones fit', time: '20 – 40 min' },
  { text: 'Write each reply from scratch', time: '30 – 60 min' },
  { text: 'Track what you answered, and what it did', time: 'every day' },
];

const WITH_US = [
  { text: 'Paste your link, we pick the rest', time: '2 min, once' },
  { text: 'Open a feed that is already ranked', time: 'done for you' },
  { text: 'Reply in your own words', time: '10 min a day' },
  { text: 'Clicks come back tagged by platform', time: 'automatic' },
];

export default function ManualVs() {
  return (
    <section className="relative w-full py-24">
      <Container className="relative z-10 mx-auto">
        <div className="mb-14 flex flex-col items-center text-center">
          <p className="text-primary mb-6 inline-flex items-center font-mono text-xs font-bold tracking-widest uppercase">
            <span className="mr-3 opacity-70">{'//'}</span>
            The alternative
          </p>
          <Heading
            as="h2"
            variant="big"
            className="text-foreground font-sans font-semibold text-balance lg:text-[48px]"
          >
            Or do it by hand, every day
          </Heading>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <div className="flex flex-col border border-white/10 p-8">
            <p className="font-mono text-xs font-bold tracking-widest text-white/50 uppercase">
              By hand
            </p>
            <ul className="mt-8 flex flex-1 flex-col gap-6">
              {MANUAL.map((item) => (
                <li key={item.text} className="flex gap-3">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-white/25" />
                  <div>
                    <p className="text-base text-white/70">{item.text}</p>
                    <p className="mt-1.5 font-mono text-xs tracking-widest text-white/30 uppercase">
                      {item.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8 border-t border-white/10 pt-6 text-base text-white/50">
              Roughly{' '}
              <span className="font-semibold text-white">
                1 – 2 hours a day
              </span>{' '}
              for one product.
            </p>
          </div>

          <div className="border-primary/40 flex flex-col border bg-white/[0.02] p-8">
            <p className="text-primary font-mono text-xs font-bold tracking-widest uppercase">
              With us
            </p>
            <ul className="mt-8 flex flex-1 flex-col gap-6">
              {WITH_US.map((item) => (
                <li key={item.text} className="flex gap-3">
                  <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="text-base text-white/80">{item.text}</p>
                    <p className="text-primary/70 mt-1.5 font-mono text-xs tracking-widest uppercase">
                      {item.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8 border-t border-white/10 pt-6 text-base text-white/60">
              Two minutes to set up, then{' '}
              <span className="font-semibold text-white">
                ten minutes a day
              </span>{' '}
              writing replies that are yours.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
