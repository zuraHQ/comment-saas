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

export default function GetStartedDialog({
  trigger,
  open,
  onOpenChange,
}: {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="light-page border-border bg-background rounded-xl p-8 sm:max-w-sm">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground">
            Sign in
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            New emails get an account automatically.
          </DialogDescription>
        </DialogHeader>

        <SignInForm />
      </DialogContent>
    </Dialog>
  );
}
