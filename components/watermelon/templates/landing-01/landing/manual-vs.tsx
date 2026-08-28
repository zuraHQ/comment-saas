import { Check, X } from 'lucide-react';
import Container from './container';
import Heading from './heading';

const MANUAL = [
  { text: 'Open eight tabs, scroll, come back in two hours', time: '30 – 60 min' },
  { text: 'Read all of it and decide what deserves a reply', time: '45 – 90 min' },
  { text: 'Write every reply from an empty box', time: '60 – 90 min' },
  { text: 'Remember who you answered, and whether it did anything', time: '15 – 30 min' },
];


export default function ManualVs() {
  return (
    <section className="relative w-full py-24">
      <Container className="relative z-10 mx-auto">
        <div className="mb-14 flex flex-col items-center text-center">
          <Heading
            as="h2"
            variant="big"
            className="text-foreground font-sans font-semibold text-balance lg:text-[48px]"
          >
            Why use us?
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
                    <p className="text-base text-neutral-600">{item.text}</p>
                    <p className="mt-1.5 font-mono text-xs tracking-widest text-red-400/50 uppercase">
                      {item.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8 border-t border-neutral-200 pt-6 text-base text-neutral-500">
              That is{' '}
              <span className="font-semibold text-red-400">
                most of a morning
              </span>
              , every day, for one product.
            </p>
          </div>

          <div className="border-primary/40 flex flex-col border bg-neutral-50 p-8">
            <p className="text-primary rounded-md text-xs font-bold tracking-wider uppercase">
              With us
            </p>

            <h3 className="mt-8 text-lg font-semibold text-neutral-900">
              Paste your link. That is the setup.
            </h3>
            <p className="mt-4 text-base leading-relaxed text-neutral-600">
              We read the same eight places and leave a reply waiting on the
              handful worth answering.
            </p>

            <p className="mt-auto border-t border-neutral-200 pt-6 text-base text-neutral-600">
              <span className="font-semibold text-neutral-900">
                Two minutes once.
              </span>{' '}
              Ten minutes a day after that.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 text-center">
          <p className="text-xl font-semibold text-neutral-900">
            That is{' '}
            <span className="text-primary">60 – 120 hours a month</span> back,
            for every product you run.
          </p>
          <a
            href="/login"
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-12 items-center px-8 rounded-md text-xs font-bold tracking-wider uppercase transition-colors active:scale-[0.97]"
          >
            Get customers
          </a>
        </div>
      </Container>
    </section>
  );
}
