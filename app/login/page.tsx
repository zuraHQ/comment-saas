"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LogoIcon from "@/assets/logo-icon";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Fake login: accept any credentials and go straight to the dashboard.
    setLoading(true);
    router.push("/dashboard");
  }

  return (
    <main className="dark flex min-h-screen items-center justify-center bg-[#101010] px-4 font-mono">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-10 flex items-center justify-center gap-3">
          <LogoIcon className="h-8 w-8 text-primary" />
          <span className="text-sm font-bold uppercase tracking-widest text-white">
            Comment SaaS
          </span>
        </Link>

        <div className="relative border border-white/10 bg-black/40 p-8 backdrop-blur-md">
          <div className="absolute left-0 top-0 h-2 w-2 border-l border-t border-white/40" />
          <div className="absolute right-0 top-0 h-2 w-2 border-r border-t border-white/40" />
          <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/40" />
          <div className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-white/40" />

          <h1 className="mb-1 text-lg font-bold uppercase tracking-widest text-white">
            Sign in
          </h1>
          <p className="mb-8 text-xs uppercase tracking-widest text-white/50">
            Any credentials will work — this is a demo.
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-none border-white/10 bg-white/5 text-white placeholder:text-white/30"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-[10px] uppercase tracking-widest text-white/60"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
        </div>

        <p className="mt-6 text-center text-[10px] uppercase tracking-widest text-white/40">
          <Link href="/" className="hover:text-white">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
