import { Suspense, type ReactNode } from "react";
import DashboardShell from "@/components/watermelon/astrix-dashboard/shell";

export default function DashboardRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
