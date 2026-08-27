import Container from './container';
import Globe from './globe';

export default function GlobeSection() {
  return (
    <section className="relative w-full overflow-hidden py-24">
      <Container className="relative z-10 mx-auto">
        <div className="mx-auto flex max-w-4xl justify-center">
          <Globe className="h-[560px] w-[560px] opacity-60 sm:h-[680px] sm:w-[680px]" />
        </div>
      </Container>
    </section>
  );
}
