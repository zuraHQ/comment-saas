"use client";

import Hero32 from "@/components/ui/hero-32";
import SiteCapture from "./site-capture";

export default function Hero() {
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
          People are asking for your <br />
          product right now
        </>
      }
      subtitle={
        <>
          We find the perfect conversations to mention your product,
          <br className="hidden md:block" /> and draft suggested replies.
        </>
      }
      action={<SiteCapture />}
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
