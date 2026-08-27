import { ArrowRight } from 'lucide-react';
import Container from './container';
import { Cta1 } from '@/components/watermelon-ui/cta-1';

export default function Cta() {
  return (
    <section className="relative w-full pb-24">
      <Container className="relative z-10 mx-auto flex justify-center">
        <Cta1
          title="Someone is asking for your product right now"
          description="Paste your link, and the first ranked posts land in a couple of minutes."
          buttonText="Get customers"
          buttonLink="/login"
          buttonIcon={<ArrowRight className="h-4 w-4" />}
        />
      </Container>
    </section>
  );
}
