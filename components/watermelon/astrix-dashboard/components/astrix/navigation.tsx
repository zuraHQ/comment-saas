"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AnchorHTMLAttributes, ReactNode } from "react";

const BASE = "/dashboard";

// Dashboard pages are real routes under /dashboard. Components keep using the
// short paths ("/", "/analytics"), and these helpers map them to real URLs.
export function toHref(path: string) {
  return path === "/" ? BASE : `${BASE}${path}`;
}

function toShortPath(pathname: string) {
  if (!pathname.startsWith(BASE)) return "/";
  const rest = pathname.slice(BASE.length);
  return rest === "" || rest === "/" ? "/" : rest.replace(/\/$/, "");
}

export function DashboardNavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

export function useDashboardNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  return {
    pathname: toShortPath(pathname ?? BASE),
    navigate: (path: string) => router.push(toHref(path)),
  };
}

export function DashboardLink({
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <Link href={toHref(href)} {...props} />;
}
