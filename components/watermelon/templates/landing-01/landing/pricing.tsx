import Container from './container';
import Heading from './heading';
import { Pricing1, type PricingPlan } from '@/components/watermelon-ui/pricing-1';

const PLANS: PricingPlan[] = [
  {
    id: 'starter',
    title: 'Starter',
    description: 'For one product, on the free platforms.',
    price: '$19',
    priceSuffix: '/month',
    href: '/login',
    buttonText: '$19',
    features: [
      { text: '1 project' },
      { text: '10 keywords' },
      { text: '10 subreddits' },
      { text: '3 watched accounts' },
      { text: 'Reddit, HN, Indie Hackers, Bluesky, GitHub, YouTube, X' },
      { text: 'AI intent scoring' },
      { text: 'Tracked links and analytics' },
    ],
  },
  {
    id: 'pro',
    title: 'Pro',
    description: 'Every platform, every comment section.',
    price: '$49',
    priceSuffix: '/month',
    href: '/login',
    buttonText: '$49',
    isPopular: true,
    features: [
      { text: '3 projects' },
      { text: '30 keywords' },
      { text: 'Unlimited subreddits' },
      { text: '15 watched accounts' },
      { text: 'Everything in Starter, plus Instagram, TikTok, LinkedIn' },
      { text: 'Comment-section monitoring' },
      { text: 'Priority fetching' },
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative w-full py-24">
      <Container className="relative z-10 mx-auto">
        <div className="mb-14 flex flex-col items-center text-center">
          <p className="text-primary mb-6 inline-flex items-center font-mono text-xs font-bold tracking-widest uppercase">
            <span className="mr-3 opacity-70">{'//'}</span>
            Pricing
          </p>
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

        <Pricing1 plans={PLANS} className="max-w-4xl px-0" />
      </Container>
    </section>
  );
}
