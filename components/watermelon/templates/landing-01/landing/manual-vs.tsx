import { Check, X } from 'lucide-react';
import Container from './container';
import Heading from './heading';

const MANUAL = [
  { text: 'Search nine platforms, every few hours', time: '20 – 40 min' },
  { text: 'Read every mention, judge which ones fit', time: '20 – 40 min' },
  { text: 'Write each reply from scratch', time: '30 – 60 min' },
  { text: 'Track what you answered, and what it did', time: 'every day' },
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
          <div className="flex flex-col border border-red-500/30 bg-red-500/[0.03] p-8">
            <p className="font-mono text-xs font-bold tracking-widest text-red-400/80 uppercase">
              By hand
            </p>
            <ul className="mt-8 flex flex-1 flex-col gap-6">
              {MANUAL.map((item) => (
                <li key={item.text} className="flex gap-3">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400/70" />
                  <div>
                    <p className="text-base text-white/70">{item.text}</p>
                    <p className="mt-1.5 font-mono text-xs tracking-widest text-red-400/50 uppercase">
                      {item.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8 border-t border-white/10 pt-6 text-base text-white/50">
              Roughly{' '}
              <span className="font-semibold text-red-400">
                1 – 2 hours a day
              </span>{' '}
              for one product.
            </p>
          </div>

          <div className="border-primary/40 flex flex-col border bg-white/[0.02] p-8">
            <p className="text-primary font-mono text-xs font-bold tracking-widest uppercase">
              With us
            </p>

            <h3 className="mt-8 text-lg font-semibold text-white">
              All you do is paste your link
            </h3>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              We watch nine platforms and rank what is worth answering.
            </p>

            <p className="mt-auto border-t border-white/10 pt-6 text-base text-white/60">
              Total:{' '}
              <span className="font-semibold text-white">2 minutes once</span>,
              then ten minutes a day.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 text-center">
          <p className="text-xl font-semibold text-white">
            That is{' '}
            <span className="text-primary">30 – 60 hours a month</span> back,
            for every product you run.
          </p>
          <a
            href="/login"
            className="bg-primary text-background hover:bg-primary/90 flex h-12 items-center px-8 font-mono text-xs font-bold tracking-widest uppercase transition-colors active:scale-[0.97]"
          >
            Get customers
          </a>
        </div>
      </Container>
    </section>
  );
}
