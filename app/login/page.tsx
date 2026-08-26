"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, useSignIn, useSignUp } from "@clerk/nextjs";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LogoIcon from "@/assets/logo-icon";

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function LoginPage() {
  return (
    <main className="dark flex min-h-screen items-center justify-center bg-[#101010] px-4 py-12 font-sans">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-10 flex items-center justify-center gap-3">
          <LogoIcon className="h-8 w-8 text-primary" />
          <span className="text-sm font-bold uppercase tracking-widest text-white">
            Comment SaaS
          </span>
        </Link>

        {clerkConfigured ? <ClerkLoginForm /> : <FakeLoginForm />}

        <p className="mt-6 text-center text-[10px] uppercase tracking-widest text-white/40">
          <Link href="/" className="hover:text-white">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative border border-white/10 bg-black/40 p-8 backdrop-blur-md">
      <div className="absolute left-0 top-0 h-2 w-2 border-l border-t border-white/40" />
      <div className="absolute right-0 top-0 h-2 w-2 border-r border-t border-white/40" />
      <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/40" />
      <div className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-white/40" />
      {children}
    </div>
  );
}

// Our own UI on top of Clerk auth: Google OAuth + email code, no passwords.
function ClerkLoginForm() {
  const router = useRouter();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();

  // The site link from the landing hero rides through sign-in into onboarding.
  const site = useSearchParams().get("site");
  const dashboardUrl = site
    ? `/dashboard?site=${encodeURIComponent(site)}`
    : "/dashboard";

  // Already signed in? Never show the sign-in screen.
  useEffect(() => {
    if (authLoaded && isSignedIn) router.replace(dashboardUrl);
  }, [authLoaded, isSignedIn, router, dashboardUrl]);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = Boolean(signIn && signUp);

  async function handleGoogle() {
    if (!signIn) return;
    setError(null);
    const { error } = await signIn.sso({
      strategy: "oauth_google",
      redirectCallbackUrl: "/sso-callback",
      redirectUrl: dashboardUrl,
    });
    if (error) setError("Google sign-in failed. Try again.");
  }

  async function handleEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!signIn || !signUp) return;
    setLoading(true);
    setError(null);

    const { error } = await signIn.emailCode.sendCode({ emailAddress: email });
    if (!error) {
      setMode("signin");
      setStep("code");
      setLoading(false);
      return;
    }

    if (error.code === "form_identifier_not_found") {
      // New email: create the account through the same form.
      const { error: createError } = await signUp.create({ emailAddress: email });
      if (!createError) {
        const { error: sendError } = await signUp.verifications.sendEmailCode();
        if (!sendError) {
          setMode("signup");
          setStep("code");
          setLoading(false);
          return;
        }
      }
      setError("Could not create an account with that email.");
      setLoading(false);
      return;
    }

    setError("Could not send a code to that email.");
    setLoading(false);
  }

  async function handleCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!signIn || !signUp) return;
    setLoading(true);
    setError(null);

    const { error } =
      mode === "signin"
        ? await signIn.emailCode.verifyCode({ code })
        : await signUp.verifications.verifyEmailCode({ code });

    if (error) {
      setError("Wrong code. Check the email and try again.");
      setLoading(false);
      return;
    }

    const { error: finalizeError } =
      mode === "signin" ? await signIn.finalize() : await signUp.finalize();
    if (finalizeError) {
      setError("Signed in, but the session could not start. Try again.");
      setLoading(false);
      return;
    }

    // Full navigation so the proxy middleware sees the new session cookie.
    window.location.assign(dashboardUrl);
  }

  if (!authLoaded || isSignedIn) {
    return (
      <CardShell>
        <p className="text-xs uppercase tracking-widest text-white/50">Loading...</p>
      </CardShell>
    );
  }

  return (
    <CardShell>
      <h1 className="mb-1 text-lg font-bold uppercase tracking-widest text-white">
        Sign in
      </h1>
      <p className="mb-8 text-xs uppercase tracking-widest text-white/50">
        New emails get an account automatically
      </p>

      {step === "email" ? (
        <div className="flex flex-col gap-4">
          <Button
            type="button"
            onClick={handleGoogle}
            disabled={!ready}
            variant="outline"
            className="h-10 rounded-none border-white/10 bg-white/5 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 hover:text-white"
          >
            <FcGoogle className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-widest text-white/40">or</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleEmail} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-[10px] uppercase tracking-widest text-white/60"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-none border-white/10 bg-white/5 text-white placeholder:text-white/30"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !ready}
              className="h-10 rounded-none bg-primary text-xs font-bold uppercase tracking-widest text-background hover:bg-primary/90"
            >
              {loading ? "Sending code..." : "Continue with email"}
            </Button>
          </form>
        </div>
      ) : (
        <form onSubmit={handleCode} className="flex flex-col gap-4">
          <p className="text-xs text-white/60">
            We sent a code to <span className="text-white">{email}</span>
          </p>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="code"
              className="text-[10px] uppercase tracking-widest text-white/60"
            >
              Code
            </label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="rounded-none border-white/10 bg-white/5 text-white placeholder:text-white/30"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !ready}
            className="h-10 rounded-none bg-primary text-xs font-bold uppercase tracking-widest text-background hover:bg-primary/90"
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="cursor-pointer text-left text-[10px] uppercase tracking-widest text-white/40 hover:text-white"
          >
            ← Use a different email
          </button>
        </form>
      )}

      {error && (
        <p className="mt-4 text-xs uppercase tracking-widest text-red-400">{error}</p>
      )}
      {/* Clerk mounts bot protection here when it is enabled */}
      <div id="clerk-captcha" className="mt-4 empty:mt-0" />
    </CardShell>
  );
}

// Placeholder when Clerk keys are missing (e.g. fresh clone): accepts anything.
function FakeLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    router.push("/dashboard");
  }

  return (
    <CardShell>
      <h1 className="mb-1 text-lg font-bold uppercase tracking-widest text-white">
        Sign in
      </h1>
      <p className="mb-8 text-xs uppercase tracking-widest text-white/50">
        Demo mode. Add Clerk keys to enable real auth.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-[10px] uppercase tracking-widest text-white/60"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            className="rounded-none border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="mt-2 h-10 rounded-none bg-primary text-xs font-bold uppercase tracking-widest text-background hover:bg-primary/90"
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </CardShell>
  );
}
