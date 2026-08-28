"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// The link is the whole signup: we read the site to learn what the product
// does. Used in the hero and again under the steps.
export default function SiteCapture() {
  const router = useRouter();
  const [site, setSite] = useState("");

  return (
    <form
      className="relative mx-auto flex w-full max-w-[18rem] flex-col gap-3"
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
        placeholder="website.com"
        className="focus:border-brand focus:ring-brand/20 h-12 w-full rounded-md border border-border bg-muted px-5 text-sm text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none transition-colors placeholder:text-muted-foreground focus:bg-background focus:ring-2"
      />
      <button
        type="submit"
        className="bg-brand hover:bg-brand/90 h-12 w-full rounded-md px-8 text-sm font-medium text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-2px_0_rgba(0,0,0,0.18)] transition-colors"
      >
        Find customers
      </button>
      <p className="text-center text-xs text-muted-foreground">
        No credit card. 100 free mentions.
      </p>
    </form>
  );
}
