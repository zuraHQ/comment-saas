"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useSignIn, useSignUp } from "@clerk/nextjs";
import { FcGoogle } from "react-icons/fc";

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const INPUT =
  "h-11 w-full rounded-md border border-neutral-300 bg-neutral-100 px-4 text-sm text-neutral-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none transition-colors placeholder:text-neutral-500 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20";

const PRIMARY =
  "h-11 w-full cursor-pointer rounded-md bg-sky-500 px-6 text-sm font-medium text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-2px_0_rgba(0,0,0,0.18)] transition-colors hover:bg-sky-600 disabled:cursor-default disabled:opacity-60";

const LABEL = "text-xs font-medium text-neutral-600";

// Our own UI on top of Clerk auth: Google OAuth + email code, no passwords.
// Shared by the login page and the Get Started modal, so there is one form.
export function SignInForm({ site }: { site?: string | null }) {
  if (!clerkConfigured) return <FakeForm />;
  return <ClerkForm site={site} />;
}

function ClerkForm({ site }: { site?: string | null }) {
  const router = useRouter();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();

  // The site link from the landing rides through sign-in into onboarding.
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
    return <p className="text-sm text-neutral-500">Loading...</p>;
  }

  return (
    <div>
      {step === "email" ? (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={!ready}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:cursor-default disabled:opacity-60"
          >
            <FcGoogle className="h-4 w-4" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs text-neutral-500">or</span>
            <span className="h-px flex-1 bg-neutral-200" />
          </div>

          <form onSubmit={handleEmail} className="flex flex-col gap-2">
            <label htmlFor="email" className={LABEL}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT}
            />
            <button type="submit" disabled={loading || !ready} className={`${PRIMARY} mt-2`}>
              {loading ? "Sending code..." : "Continue with email"}
            </button>
          </form>
        </div>
      ) : (
        <form onSubmit={handleCode} className="flex flex-col gap-2">
          <p className="mb-2 text-sm text-neutral-600">
            We sent a code to <span className="text-neutral-900">{email}</span>
          </p>
          <label htmlFor="code" className={LABEL}>
            Code
          </label>
          <input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={INPUT}
          />
          <button type="submit" disabled={loading || !ready} className={`${PRIMARY} mt-2`}>
            {loading ? "Verifying..." : "Verify"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="mt-1 cursor-pointer text-left text-xs text-neutral-500 hover:text-neutral-900"
          >
            ← Use a different email
          </button>
        </form>
      )}

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      {/* Clerk mounts bot protection here when it is enabled */}
      <div id="clerk-captcha" className="mt-4 empty:mt-0" />
    </div>
  );
}

// Placeholder when Clerk keys are missing (e.g. fresh clone): accepts anything.
function FakeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setLoading(true);
        router.push("/dashboard");
      }}
      className="flex flex-col gap-2"
    >
      <p className="mb-2 text-sm text-neutral-500">
        Demo mode. Add Clerk keys to enable real auth.
      </p>
      <label htmlFor="email" className={LABEL}>
        Email
      </label>
      <input
        id="email"
        type="email"
        placeholder="you@example.com"
        required
        className={INPUT}
      />
      <button type="submit" disabled={loading} className={`${PRIMARY} mt-2`}>
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
