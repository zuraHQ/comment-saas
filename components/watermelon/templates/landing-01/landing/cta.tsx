import Container from './container';
import Heading from './heading';

export default function Cta() {
  return (
    <section className="relative w-full pb-24">
      <Container className="relative z-10 mx-auto">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 border border-neutral-200 bg-neutral-50 p-10 md:flex-row md:items-center md:p-14">
          <div className="max-w-xl">
            <Heading
              as="h2"
              variant="big"
              className="text-foreground font-sans font-semibold text-balance lg:text-[36px]"
            >
              Someone is asking for your product right now
            </Heading>
            <p className="mt-4 text-base text-neutral-500">
              Paste your link. The first ranked posts land in a couple of
              minutes.
            </p>
          </div>
          <a
            href="/login"
            className="bg-primary text-background hover:bg-primary/90 flex h-12 shrink-0 items-center px-8 font-mono text-xs font-bold tracking-widest uppercase transition-colors active:scale-[0.97]"
          >
            Get customers
          </a>
        </div>
      </Container>
    </section>
  );
}
