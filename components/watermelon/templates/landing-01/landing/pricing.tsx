import { Check } from 'lucide-react';
import Container from './container';
import Heading from './heading';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    name: 'Starter',
    price: '19',
    blurb: 'For one product, on the free platforms.',
    features: [
      '1 project',
      '10 keywords',
      '10 subreddits',
      '3 watched accounts',
      'Reddit, HN, Bluesky, GitHub, YouTube, X',
      'AI intent scoring',
      'Tracked links and analytics',
    ],
    cta: 'Start free trial',
    featured: false,
  },
  {
    name: 'Pro',
    price: '49',
    blurb: 'Every platform, every comment section.',
    features: [
      '3 projects',
      '30 keywords',
      'Unlimited subreddits',
      '15 watched accounts',
      'Everything in Starter, plus Instagram, TikTok, LinkedIn',
      'Comment-section monitoring',
      'Priority fetching',
    ],
    cta: 'Start free trial',
    featured: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative w-full py-24">
      <Container className="relative z-10 mx-auto">
        <div className="mb-14 flex flex-col items-center text-center">
          <Heading
            as="h2"
            variant="big"
            className="text-foreground font-sans font-semibold text-balance lg:text-[48px]"
          >
            One reply can pay for a year.
          </Heading>
          <p className="mt-4 max-w-xl text-sm text-white/50">
            Free while in beta. Cancel any time.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col border p-8',
                plan.featured
                  ? 'border-primary/50 bg-white/[0.03]'
                  : 'border-white/10 bg-white/[0.01]',
              )}
            >
              {plan.featured ? (
                <span className="bg-primary text-background absolute -top-3 left-8 px-3 py-1 font-mono text-[10px] font-bold tracking-widest uppercase">
                  Most popular
                </span>
              ) : null}

              <p className="font-mono text-xs font-bold tracking-widest text-white/60 uppercase">
                {plan.name}
              </p>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-semibold text-white">
                  ${plan.price}
                </span>
                <span className="text-sm text-white/40">/month</span>
              </p>
              <p className="mt-3 text-sm text-white/50">{plan.blurb}</p>

              <ul className="mt-8 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/login"
                className={cn(
                  'mt-8 flex h-12 items-center justify-center font-mono text-xs font-bold tracking-widest uppercase transition-colors',
                  plan.featured
                    ? 'bg-primary text-background hover:bg-primary/90'
                    : 'border border-white/20 text-white hover:bg-white/10',
                )}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
