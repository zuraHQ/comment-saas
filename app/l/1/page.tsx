"use client";

import { useRouter } from "next/navigation";
import Hero1 from "@/components/ui/hero-1";

// Preview: watermelon hero-1 layout with our copy and email capture.
export default function LandingPreview1() {
  const router = useRouter();

  return (
    <Hero1
      brand="Watermelon"
      navLinks={[
        { label: "How it works", href: "#how-it-works", active: true },
        { label: "Use cases", href: "#use-cases" },
        { label: "Pricing", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
      ]}
      headline={
        <>
          Get your product in front
          <br />
          of <span className="text-[#A3FF12]">people who need it</span>
        </>
      }
      description=""
      socialLinks={[]}
      signInLabel="Sign in"
      signInHref="/login"
      ctaSlot={
        <form
          className="flex w-full flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/login");
          }}
        >
          <input
            type="email"
            required
            placeholder="you@company.com"
            className="h-12 flex-1 rounded-lg border border-white/15 bg-white/5 px-5 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/40"
          />
          <button
            type="submit"
            className="h-12 shrink-0 rounded-lg bg-white px-8 text-sm font-medium text-black transition-all hover:bg-white/90"
          >
            Get Started
          </button>
        </form>
      }
    />
  );
}
