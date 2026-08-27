import { Check, X } from 'lucide-react';
import Container from './container';
import Heading from './heading';

const MANUAL = [
  {
    text: 'Check nine platforms every few hours for anything worth answering',
    time: '20 – 40 min',
  },
  {
    text: 'Read every mention and work out which ones your product actually fits',
    time: '20 – 40 min',
  },
  {
    text: 'Write a reply for each one, from scratch, without repeating yourself',
    time: '30 – 60 min',
  },
  {
    text: 'Remember what you already answered, and guess which ones brought anyone back',
    time: 'every day',
  },
];

const WITH_US = [
  {
    text: 'Paste your site link. We read it and pick the keywords and communities for you',
    time: '2 min, once',
  },
  {
    text: 'Open the feed. Everything is already read, ranked, and explained',
    time: 'done for you',
  },
  {
    text: 'Reply in your own words to the ones marked high intent',
    time: '10 min a day',
  },
  {
    text: 'Replied and skipped posts disappear. Clicks come back tagged by platform',
    time: 'automatic',
  },
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
            <ul className="mt-6 flex flex-1 flex-col gap-5">
              {MANUAL.map((item) => (
                <li key={item.text} className="flex gap-3">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-white/25" />
                  <div>
                    <p className="text-sm text-white/70">{item.text}</p>
                    <p className="mt-1 font-mono text-[10px] tracking-widest text-white/30 uppercase">
                      {item.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8 border-t border-white/10 pt-6 text-sm text-white/50">
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
            <ul className="mt-6 flex flex-1 flex-col gap-5">
              {WITH_US.map((item) => (
                <li key={item.text} className="flex gap-3">
                  <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="text-sm text-white/80">{item.text}</p>
                    <p className="text-primary/70 mt-1 font-mono text-[10px] tracking-widest uppercase">
                      {item.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8 border-t border-white/10 pt-6 text-sm text-white/60">
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
