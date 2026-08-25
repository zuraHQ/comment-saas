import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Tracked reply link: logs the click in Convex, then forwards to the target.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  let target: string | null = null;
  try {
    target = await convex.mutation(api.links.logClickAndGetTarget, {
      code,
      referrer: req.headers.get("referer") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });
  } catch {
    // If logging fails, still send the visitor somewhere sensible.
  }

  return NextResponse.redirect(target ?? new URL("/", req.url), 302);
}
