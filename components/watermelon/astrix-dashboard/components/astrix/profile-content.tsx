"use client";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileContent() {
  const me = useQuery(api.users.me);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">Profile</h1>

      <section className="flex items-center gap-4 border border-border bg-sidebar-accent/20 p-5">
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

      <section className="flex flex-col gap-4 border border-border bg-sidebar-accent/20 p-5">
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

    </div>
  );
}
