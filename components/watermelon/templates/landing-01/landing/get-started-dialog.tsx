'use client';

import type { ReactNode } from 'react';
import { SignInForm } from '@/components/auth/sign-in-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function GetStartedDialog({ trigger }: { trigger: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-xl border-neutral-200 bg-white p-8 sm:max-w-sm">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-neutral-900">
            Sign in
          </DialogTitle>
          <DialogDescription className="text-neutral-600">
            New emails get an account automatically.
          </DialogDescription>
        </DialogHeader>

        <SignInForm />
      </DialogContent>
    </Dialog>
  );
}
