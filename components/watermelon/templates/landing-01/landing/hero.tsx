"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Hero32 from "@/components/ui/hero-32";

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
        className="h-12 flex-1 rounded-full border border-white/30 bg-white/20 px-6 text-sm text-white backdrop-blur-sm outline-none transition-colors placeholder:text-white/60 focus:border-white/60"
      />
      <button
        type="submit"
        className="h-12 shrink-0 rounded-full bg-white px-8 text-sm font-medium text-sky-500 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.96]"
      >
        Find customers
      </button>
    </form>
  );

  return (
    <Hero32
      logoText="commentsaas"
      navItems={["How it works", "Pricing", "FAQ"]}
      navHrefs={["#how-it-works", "#pricing", "#faq"]}
      loginText="Sign in"
      loginHref="/login"
      title={
        <>
          Someone is asking for <br />
          your <span className="italic">product</span> right now
        </>
      }
      subtitle={
        <>
          We find the perfect conversations to mention your product,
          <br className="hidden md:block" /> and draft suggested replies.
        </>
      }
      action={captureForm}
    />
  );
}
