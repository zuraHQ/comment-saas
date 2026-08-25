"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// The proxy protects /dashboard on navigation; this also kicks out a tab whose
// session dies while it is open (user deleted, session revoked, signed out).
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

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-xs tracking-widest text-muted-foreground uppercase">
          Checking session...
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
