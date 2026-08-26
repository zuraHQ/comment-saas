"use client";

import { useMutation, useQuery } from "convex/react";
import { Check } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { PLATFORM_OPTIONS } from "./project-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// One toggle per platform: the platform list IS the integration list.
const DESCRIPTIONS: Record<string, string> = {
  reddit: "Subreddits you watch plus keyword sweeps across Reddit.",
  hn: "Every Hacker News story, Ask HN and Show HN.",
  bluesky: "Keyword search across Bluesky.",
  github: "Watch repo discussions like communities. Best for dev tools.",
  youtube: "New videos matching your keywords.",
  facebook: "Comment sections of pages you pick in project settings.",
  instagram: "Comments under the accounts you watch.",
  tiktok: "Comments under the TikTok accounts you watch.",
  x: "Keyword search on X.",
  linkedin: "Keyword search across LinkedIn posts.",
  threads: "Coming later.",
};

const INTEGRATIONS = PLATFORM_OPTIONS.map((platform) => ({
  id: platform.id,
  label: platform.label,
  Icon: platform.Icon,
  iconBg: platform.bg,
  iconFg: platform.fg,
  description: DESCRIPTIONS[platform.id] ?? "",
  ready: platform.live,
}));

export function ProfileContent() {
  const me = useQuery(api.users.me);
  const setIntegration = useMutation(api.users.setIntegration);

  const enabled = new Set(me?.integrations ?? []);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">Profile</h1>

      <section className="flex items-center gap-4 border border-border p-5">
        <Avatar className="size-14">
          <AvatarImage src={me?.imageUrl} alt={me?.name ?? ""} />
          <AvatarFallback>
            {(me?.name?.[0] ?? "?").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{me?.name ?? "..."}</p>
          <p className="truncate text-sm text-muted-foreground">
            {me?.email ?? ""}
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4 border border-border p-5">
        <div>
          <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Billing
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 border border-border p-4">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-sm font-medium">
              Free plan
              <span className="border border-primary/40 px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary uppercase">
                Beta
              </span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Everything is free while we are in beta. Paid plans arrive at
              launch.
            </p>
          </div>
          <button
            type="button"
            disabled
            className="h-9 shrink-0 border border-border px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase opacity-50"
          >
            Manage billing
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-4 border border-border p-5">
        <div>
          <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Integrations
          </h2>
        </div>

        {INTEGRATIONS.map((integration) => {
          const on = enabled.has(integration.id);
          return (
            <div
              key={integration.id}
              className="flex items-center gap-4 border border-border p-4"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center"
                style={{ backgroundColor: integration.iconBg }}
              >
                <integration.Icon
                  className="h-5 w-5"
                  style={{ color: integration.iconFg }}
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {integration.label}
                  {!integration.ready ? (
                    <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
                      soon
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {integration.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setIntegration({
                    integration: integration.id,
                    enabled: !on,
                  }).catch(console.error)
                }
                aria-pressed={on}
                aria-label={`Toggle ${integration.label}`}
                className={cn(
                  "flex h-8 w-14 shrink-0 cursor-pointer items-center border px-1 transition-colors",
                  on
                    ? "justify-end border-primary bg-primary/20"
                    : "justify-start border-border",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center",
                    on ? "bg-primary text-[#101010]" : "bg-muted-foreground/40",
                  )}
                >
                  {on ? <Check className="size-3.5" /> : null}
                </span>
              </button>
            </div>
          );
        })}
      </section>
    </div>
  );
}
