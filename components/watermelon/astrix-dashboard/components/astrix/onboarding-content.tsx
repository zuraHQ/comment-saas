"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { Check, Loader2, LogOut, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/watermelon/templates/landing-01/landing/navbar";
import { PLATFORM_OPTIONS, useProject } from "./project-context";
import { CATEGORIES, suggestCommunities } from "@/lib/subreddit-catalog";

const STEPS = ["Your site", "What we found", "Platforms"] as const;

// Stand-in for the real scraper: derives a plausible product from the domain.
function fakeScrape(url: string) {
  let host = url;
  try {
    host = new URL(url).hostname;
  } catch {
    host = url;
  }
  host = host.replace(/^www\./, "");
  const base = host.split(".")[0] || "Your product";
  const name = base.charAt(0).toUpperCase() + base.slice(1);
  return {
    name,
    categories: ["marketing", "sales"],
    description: `${name} helps small teams stop doing a recurring manual job by hand. Built for founders and operators at companies under 20 people.`,
    keywords: [
      `${base} alternative`,
      "looking for a tool",
      "spreadsheet is killing me",
      "any recommendations",
    ],
  };
}

export function OnboardingContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { signOut } = useClerk();
  const site = params.get("site") ?? "";
  const { addProject, updateProject } = useProject();
  const complete = useMutation(api.users.completeOnboarding);

  // The landing page already asked for the link, so skip straight to the result.
  const [step, setStep] = useState(site ? 1 : 0);
  const [scanning, setScanning] = useState(true);
  const [url, setUrl] = useState(site);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>(["reddit", "hn"]);
  const [categories, setCategories] = useState<string[]>([]);
  const [communities, setCommunities] = useState<string[]>(
    suggestCommunities([]),
  );

  const toggleCategory = (id: string) => {
    const next = categories.includes(id)
      ? categories.filter((c) => c !== id)
      : [...categories, id];
    if (next.length > 3) return;
    setCategories(next);
    // Re-derive the suggested rooms; manual edits after this stick until the
    // next category change.
    setCommunities(suggestCommunities(next));
  };
  const [saving, setSaving] = useState(false);

  // Fake the scrape once on mount so the first step has something to show.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const result = fakeScrape(site || "yourproduct.com");
    timer.current = setTimeout(() => {
      setName(result.name);
      setDescription(result.description);
      setKeywords(result.keywords);
      setCategories(result.categories);
      setCommunities(suggestCommunities(result.categories));
      setScanning(false);
    }, 1400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [site]);

  const togglePlatform = (id: string) =>
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );

  const finish = async () => {
    setSaving(true);
    try {
      const projectId = await addProject(name || "My product");
      await updateProject(projectId, {
        url,
        description,
        keywords,
        lockedKeywords: keywords,
        communities,
        platforms,
      });
      await complete({});
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div className="relative flex min-h-screen justify-center bg-background px-4 pt-32 pb-16">
      <Navbar
        minimal
        action={
          <button
            type="button"
            onClick={() => signOut(() => router.push("/login"))}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-border px-6 text-xs font-bold tracking-widest uppercase transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <LogOut className="size-3.5" />
            Log out
          </button>
        }
      />

      <div className="w-full max-w-2xl">
        <ol className="mb-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex items-center gap-2 text-xs font-bold tracking-wider uppercase",
                  i === step
                    ? "text-foreground"
                    : i < step
                      ? "text-primary"
                      : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center border",
                    i === step
                      ? "border-foreground"
                      : i < step
                        ? "border-brand bg-brand text-brand-foreground"
                        : "border-border",
                  )}
                >
                  {i < step ? <Check className="size-3.5" /> : i + 1}
                </span>
                {label}
              </span>
              {i < STEPS.length - 1 ? (
                <span className="h-px w-6 bg-border" />
              ) : null}
            </li>
          ))}
        </ol>

        <div className="rounded-lg border border-border p-6">
          {step === 0 ? (
            <Step
              title="Reading your site"
              subtitle="We use this to work out what you build and who it is for."
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Your product URL</label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="yoursaas.com"
                  className="h-9 rounded-md"
                />
              </div>

              <ul className="flex flex-col gap-2 rounded-lg border border-border p-4 text-sm">
                {[
                  "Fetching the page",
                  "Reading your copy",
                  "Working out what you sell",
                ].map((line) => (
                  <li key={line} className="flex items-center gap-3">
                    {scanning ? (
                      <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                    ) : (
                      <Check className="size-4 shrink-0 text-primary" />
                    )}
                    <span
                      className={
                        scanning ? "text-muted-foreground" : "text-foreground"
                      }
                    >
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                Mock data for now. The real scraper lands with the pipeline.
              </p>
            </Step>
          ) : null}

          {step === 1 ? (
            <Step
              title="Did we get this right?"
              subtitle="Fix anything that is off. This is what we match posts against."
            >
              {scanning ? (
                <div className="flex items-center gap-3 rounded-lg border border-border p-4 text-sm text-muted-foreground">
                  <Loader2 className="size-4 shrink-0 animate-spin" />
                  Reading {url || "your site"}...
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Product name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 rounded-md"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">What it does</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-none border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
                />
              </div>


              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">What space is it in?</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => {
                    const on = categories.includes(category.id);
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        aria-pressed={on}
                        className={cn(
                          "cursor-pointer border px-3 py-1.5 text-sm transition-colors",
                          on
                            ? "border-primary/40 bg-sidebar-accent/40 text-foreground"
                            : "border-border text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                        )}
                      >
                        {category.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Phrases we will watch for
                </label>
                <p className="text-sm text-muted-foreground">
                  {keywords.join(", ")}
                </p>
              </div>
            </Step>
          ) : null}

          {step === 2 ? (
            <Step
              title="Where should we look?"
              subtitle="Pick the platforms your customers actually hang out on."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {PLATFORM_OPTIONS.map((platform) => {
                  const on = platforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => togglePlatform(platform.id)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border p-3 text-left text-sm transition-colors",
                        on
                          ? "border-primary/40 bg-sidebar-accent/40"
                          : "border-border hover:bg-sidebar-accent/60",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded border",
                          on ? "border-brand bg-brand" : "border-border",
                        )}
                      >
                        {on ? <Check className="size-4 text-[#101010]" /> : null}
                      </span>
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center"
                        style={{ backgroundColor: platform.bg }}
                      >
                        <platform.Icon
                          className="h-3.5 w-3.5"
                          style={{ color: platform.fg }}
                        />
                      </span>
                      <span className="flex-1">{platform.label}</span>
                      {!platform.live ? (
                        <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
                          soon
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

            </Step>
          ) : null}

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="h-10 cursor-pointer px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase hover:text-foreground disabled:cursor-default disabled:opacity-40"
            >
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={scanning && step <= 1}
                className="bg-brand text-brand-foreground hover:bg-brand/90 h-10 cursor-pointer rounded-md px-6 text-xs font-bold tracking-wider uppercase shadow-[inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-2px_0_rgba(0,0,0,0.18)] disabled:cursor-default disabled:opacity-50"
              >
                {scanning && step <= 1 ? "Reading..." : "Next"}
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                disabled={saving}
                className="bg-brand text-brand-foreground hover:bg-brand/90 h-10 cursor-pointer rounded-md px-6 text-xs font-bold tracking-wider uppercase shadow-[inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-2px_0_rgba(0,0,0,0.18)] disabled:cursor-default disabled:opacity-50"
              >
                {saving ? "Setting up..." : "Done"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

