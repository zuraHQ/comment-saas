"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import type { AnchorHTMLAttributes, ReactNode } from "react";

const BASE = "/dashboard";

// Project pages live under /dashboard/<slug>/...; account-level pages sit
// directly under /dashboard. Components keep using short paths ("/",
// "/analytics", "/profile") and these helpers resolve the real URL.
const ACCOUNT_PATHS = ["/profile"];

export function useProjectSlug(): string | null {
  const params = useParams();
  const slug = params?.project;
  return typeof slug === "string" ? slug : null;
}

function buildHref(path: string, slug: string | null) {
  if (ACCOUNT_PATHS.includes(path)) return `${BASE}${path}`;
  if (!slug) return BASE;
  return path === "/" ? `${BASE}/${slug}` : `${BASE}/${slug}${path}`;
}

function toShortPath(pathname: string, slug: string | null) {
  if (!pathname.startsWith(BASE)) return "/";
  let rest = pathname.slice(BASE.length);
  if (slug && rest.startsWith(`/${slug}`)) rest = rest.slice(slug.length + 1);
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
  const slug = useProjectSlug();
  return {
    pathname: toShortPath(pathname ?? BASE, slug),
    slug,
    navigate: (path: string) => router.push(buildHref(path, slug)),
  };
}

export function DashboardLink({
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const slug = useProjectSlug();
  return <Link href={buildHref(href, slug)} {...props} />;
}
