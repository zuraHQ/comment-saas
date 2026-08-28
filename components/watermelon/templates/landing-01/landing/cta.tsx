'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from './container';
import Heading from './heading';
import GetStartedDialog from './get-started-dialog';

export default function Cta() {
  const router = useRouter();
  const [site, setSite] = useState('');
  const [signInOpen, setSignInOpen] = useState(false);

  return (
    <section className="relative w-full pb-24">
      <Container className="relative z-10 mx-auto">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
          <div>
            <Heading
              as="h2"
              variant="big"
              className="text-foreground font-sans font-semibold text-balance lg:text-[36px]"
            >
              Someone is asking for your product right now
            </Heading>
            <p className="mt-4 text-base text-muted-foreground">
              Paste your link. The first ranked posts land in a couple of
              minutes.
            </p>
          </div>

          <form
            className="flex w-full max-w-[18rem] flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const value = site.trim();
              // No link yet? Take them to sign in rather than nowhere.
              if (!value) {
                setSignInOpen(true);
                return;
              }
              const url = /^https?:\/\//i.test(value)
                ? value
                : `https://${value}`;
              router.push(`/login?site=${encodeURIComponent(url)}`);
            }}
          >
            <input
              type="text"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              inputMode="url"
              autoComplete="url"
              placeholder="website.com"
              className="focus:border-brand focus:ring-brand/20 h-12 w-full rounded-md border border-border bg-muted px-5 text-sm text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none transition-colors placeholder:text-muted-foreground focus:bg-background focus:ring-2"
            />
            <button
              type="submit"
              className="bg-brand hover:bg-brand/90 h-12 w-full rounded-md px-8 text-sm font-medium text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-2px_0_rgba(0,0,0,0.18)] transition-colors"
            >
              Get customers
            </button>
          </form>
        </div>
      </Container>

      <GetStartedDialog open={signInOpen} onOpenChange={setSignInOpen} />
    </section>
  );
}
