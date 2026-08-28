"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import LogoIcon from "@/assets/logo-icon";

// The site link from the landing rides through sign-in into onboarding.
function LoginCard() {
  const site = useSearchParams().get("site");
  return <SignInForm site={site} />;
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-12 font-sans">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-10 flex items-center justify-center gap-3">
          <LogoIcon className="text-primary h-8 w-8" />
          <span className="text-sm font-bold tracking-widest text-neutral-900 uppercase">
            Comment SaaS
          </span>
        </Link>

        <div className="rounded-xl border border-neutral-200 bg-white p-8">
          <h1 className="mb-1 text-2xl font-semibold tracking-tight text-neutral-900">
            Sign in
          </h1>
          <p className="mb-6 text-sm text-neutral-600">
            New emails get an account automatically.
          </p>
          <Suspense fallback={<p className="text-sm text-neutral-500">Loading...</p>}>
            <LoginCard />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-900">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
