"use client";

import { LogOut, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currentUser } from "../../data";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const triggerClassName =
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 h-auto gap-2.5 rounded-xl px-1.5 py-1.5 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:rounded-full! group-data-[collapsible=icon]:p-0!";

function initialsOf(name: string, email: string) {
  const source = name.trim() || email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase();
}

// Clerk is the source of truth when keys are present; the mock keeps the
// dashboard usable on a fresh clone without keys.
export function AccountMenu() {
  return clerkConfigured ? <ClerkAccountMenu /> : <MockAccountMenu />;
}

function ClerkAccountMenu() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded) {
    return <div className="h-13 w-full animate-none rounded-xl bg-sidebar-accent/40" />;
  }

  const name = user?.fullName ?? user?.username ?? "";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <Shell
      name={name || email}
      email={email}
      avatar={user?.imageUrl}
      onSignOut={() => signOut(() => router.push("/login"))}
    />
  );
}

function MockAccountMenu() {
  return (
    <Shell
      name={currentUser.name}
      email={currentUser.email}
      avatar={currentUser.avatar}
      onSignOut={null}
    />
  );
}

function Shell({
  name,
  email,
  avatar,
  onSignOut,
}: {
  name: string;
  email: string;
  avatar?: string;
  onSignOut: (() => void) | null;
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        className={cn(triggerClassName)}
        aria-label="Account menu"
      >
        <Avatar className="size-10 after:border-[0.15625rem]">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{initialsOf(name, email)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
          <p className="truncate text-base font-semibold">{name}</p>
          <p className="truncate text-sm text-muted-foreground">{email}</p>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="top"
        className="astrix-dashboard w-56"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <p className="font-medium text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleTheme}>
          {theme === "dark" ? <Sun /> : <Moon />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </DropdownMenuItem>
        {onSignOut ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onSignOut}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
