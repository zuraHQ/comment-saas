"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Hero32 from "@/components/ui/hero-32";
import HeroDemo from "./hero-demo";

export default function Hero() {
  const router = useRouter();
  const [site, setSite] = useState("");

  // The link is the whole signup: we read the site to learn what the product
  // does, so the CTA replaces the block's demo buttons.
  const captureForm = (
    <form
      className="flex w-full max-w-xl flex-col gap-3 sm:flex-row"
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
        className="h-12 flex-1 rounded-md border border-neutral-300 bg-white px-5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900"
      />
      <button
        type="submit"
        className="h-12 shrink-0 rounded-md bg-sky-500 px-8 text-sm font-medium text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-2px_0_rgba(0,0,0,0.18)] transition-colors hover:bg-sky-600"
      >
        Find customers
      </button>
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
        <div className="relative mx-auto w-[min(72rem,calc(100vw-2rem))] overflow-hidden border border-neutral-200 bg-[#101010] text-left">
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2.5">
            <span className="h-2 w-2 bg-[#FF5F57]" />
            <span className="h-2 w-2 bg-[#FEBC2E]" />
            <span className="h-2 w-2 bg-[#28C840]" />
          </div>
          <div className="aspect-video w-full">
            <HeroDemo />
          </div>
        </div>
      }
    />
  );
}
