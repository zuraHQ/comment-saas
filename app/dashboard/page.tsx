import { Suspense } from "react";
import AstrixDashboardDemo from "@/components/watermelon/astrix-dashboard/demo";

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <AstrixDashboardDemo />
    </Suspense>
  );
}
