"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// The proxy already validated the session before this page was served, so the
// dashboard renders straight away. This only catches a session that dies while
// the tab is open (user deleted, session revoked, signed out elsewhere).
export function AuthGate({ children }: { children: ReactNode }) {
  if (!clerkConfigured) return <>{children}</>;
  return <ClerkAuthGate>{children}</ClerkAuthGate>;
}

function ClerkAuthGate({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/login");
  }, [isLoaded, isSignedIn, router]);

  return <>{children}</>;
}
