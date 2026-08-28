'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Same capture as the hero: the link is the whole signup, so the modal asks
// for it rather than sending people to a sign in page first.
export default function GetStartedDialog({ trigger }: { trigger: ReactNode }) {
  const router = useRouter();
  const [site, setSite] = useState('');

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-xl border-neutral-200 bg-white p-8 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight text-neutral-900">
            Find your first conversations
          </DialogTitle>
          <DialogDescription className="text-neutral-600">
            Paste your link. We read the site to learn what you do, then go
            looking for people asking for it.
          </DialogDescription>
        </DialogHeader>

        <form
          className="mt-2 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const value = site.trim();
            if (!value) return;
            const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
            router.push(`/login?site=${encodeURIComponent(url)}`);
          }}
        >
          <input
            type="text"
            required
            autoFocus
            value={site}
            onChange={(e) => setSite(e.target.value)}
            inputMode="url"
            autoComplete="url"
            placeholder="yoursaas.com"
            className="h-12 w-full rounded-md border border-neutral-300 bg-neutral-100 px-5 text-sm text-neutral-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none transition-colors placeholder:text-neutral-500 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20"
          />
          <button
            type="submit"
            className="h-12 w-full rounded-md bg-sky-500 px-8 text-sm font-medium text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-2px_0_rgba(0,0,0,0.18)] transition-colors hover:bg-sky-600"
          >
            Find customers
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link href="/login" className="text-neutral-900 underline">
            Sign in
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  );
}
