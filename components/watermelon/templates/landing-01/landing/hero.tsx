"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Hero32 from "@/components/ui/hero-32";

export default function Hero() {
  const router = useRouter();
  const [site, setSite] = useState("");

  // The link is the whole signup: we read the site to learn what the product
  // does, so the CTA replaces the block's demo buttons.
  // A scribbled pointer at the input, so the one thing to do is obvious.
  const nudge = (
    <span className="pointer-events-none absolute -top-28 -left-40 hidden flex-col items-start lg:flex">
      <span
        className="text-brand -rotate-6 text-2xl"
        style={{ fontFamily: "var(--font-handwriting)" }}
      >
        drop your saas here
      </span>
      <svg
        viewBox="0 0 80 72"
        aria-hidden="true"
        className="text-brand ml-10 h-20 w-20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 4c-2 26 8 46 40 60" />
        <path d="M48 64l-13-2" />
        <path d="M48 64l-2-13" />
      </svg>
    </span>
  );

  const captureForm = (
    <form
      className="relative mx-auto flex w-full max-w-sm flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const value = site.trim();
        if (!value) return;
        const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
        router.push(`/login?site=${encodeURIComponent(url)}`);
      }}
    >
      <input
        type="text"
        required
        value={site}
        onChange={(e) => setSite(e.target.value)}
        inputMode="url"
        autoComplete="url"
        placeholder="yoursaas.com"
        className="h-12 w-full rounded-md border border-neutral-300 bg-neutral-100 px-5 text-sm text-neutral-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none transition-colors placeholder:text-neutral-500 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
      />
      <button
        type="submit"
        className="h-12 w-full rounded-md bg-brand px-8 text-sm font-medium text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-2px_0_rgba(0,0,0,0.18)] transition-colors hover:bg-brand/90"
      >
        Find customers
      </button>
      {nudge}
    </form>
  );

  return (
    <Hero32
      showNav={false}
      logoText="commentsaas"
      navItems={["How it works", "Pricing", "FAQ"]}
      navHrefs={["#how-it-works", "#pricing", "#faq"]}
      loginText="Sign in"
      loginHref="/login"
      title={
        <>
          We read the internet <br />
          You get customers
        </>
      }
      subtitle={
        <>
          We find the perfect conversations to mention your product,
          <br className="hidden md:block" /> and draft suggested replies.
        </>
      }
      action={captureForm}
      below={
        <div className="mx-auto w-[min(72rem,calc(100vw-2rem))] rounded-[2rem] border-[10px] border-neutral-900/5">
          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white text-left">
            <div className="aspect-video w-full bg-neutral-50" />
          </div>
        </div>
      }
    />
  );
}
