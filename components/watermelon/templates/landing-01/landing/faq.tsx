import Container from './container';
import { Faq1, type FaqItem } from '@/components/watermelon-ui/faq-1';

const FAQS: FaqItem[] = [
  {
    id: 'post-for-me',
    question: 'Do you post the replies for me?',
    answer:
      'No. We find the post and write you a draft. You read it, change what you want and post it yourself, from your own account. That is deliberate: automated posting is what gets accounts banned, and a reply nobody read is a reply nobody trusts.',
  },
  {
    id: 'ban',
    question: 'Will this get my account banned?',
    answer:
      'Not from using us. We only read public posts, and we never touch your accounts or send anything on your behalf. What gets people banned is dropping the same link into fifty threads. Reply like a person, mention your product when it actually answers the question, and you are doing what these communities already reward.',
  },
  {
    id: 'vs-search',
    question: 'How is this different from just searching Reddit myself?',
    answer:
      'Search shows you everything that matches a word. We read ten platforms end to end, rank every post by whether the person is actually looking for something like yours, and tell you why. You read ten posts a day instead of four hundred.',
  },
  {
    id: 'niche',
    question: 'What if my niche is not on these platforms?',
    answer:
      'Tell us the communities and accounts you already read and we watch those. If your customers are somewhere we do not cover yet, say so and we will look at adding it.',
  },
  {
    id: 'speed',
    question: 'How fast do posts show up?',
    answer:
      'Reddit, Hacker News, Indie Hackers, Bluesky and GitHub run continuously, so posts land within minutes. The scraped platforms run on a slower schedule to keep costs sane.',
  },
  {
    id: 'projects',
    question: 'Can I run more than one product?',
    answer:
      'Yes. Each project has its own keywords, communities, feed and tracked link, so nothing bleeds between them.',
  },
  {
    id: 'cancel',
    question: 'Can I cancel any time?',
    answer:
      'Yes, from your billing settings, with no call and no email to anyone.',
  },
];

export default function Faq() {
  return (
    <section className="relative w-full py-12">
      <Container className="relative z-10 mx-auto">
        <Faq1 title="FAQ" faqs={FAQS} />
      </Container>
    </section>
  );
}
