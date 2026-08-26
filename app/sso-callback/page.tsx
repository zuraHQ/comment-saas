"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

// Google (and future OAuth) lands here; Clerk finishes the handshake and
// transfers unknown accounts into sign-up automatically.
export default function SsoCallbackPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#101010] font-sans">
      <span className="text-xs uppercase tracking-widest text-white/40">
        Signing you in...
      </span>
      <AuthenticateWithRedirectCallback />
    </main>
  );
}
