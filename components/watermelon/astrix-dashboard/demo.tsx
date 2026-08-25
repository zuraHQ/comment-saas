"use client";

import type { ReactNode } from "react";
import DashboardLayout from "./dashboard-layout";
import { ClassificationContent } from "./components/astrix/classification-content";
import { DashboardContent } from "./components/astrix/dashboard-content";
import {
  DashboardNavigationProvider,
  useDashboardNavigation,
} from "./components/astrix/navigation";
import { ReportsContent } from "./components/astrix/reports-content";
import { ThemeProvider } from "./components/astrix/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

function DashboardRoute() {
  const { pathname } = useDashboardNavigation();

  let content: ReactNode = <DashboardContent />;

  if (pathname === "/classification") {
    content = <ClassificationContent />;
  } else if (pathname === "/reports") {
    content = <ReportsContent />;
  } else if (
    pathname === "/integration" ||
    pathname === "/compliance" ||
    pathname === "/settings"
  ) {
    content = null;
  }

  return <DashboardLayout>{content}</DashboardLayout>;
}

export default function AstrixDashboardDemo() {
  return (
    <TooltipProvider>
      <ThemeProvider>
        <DashboardNavigationProvider>
          <DashboardRoute />
        </DashboardNavigationProvider>
      </ThemeProvider>
    </TooltipProvider>
  );
}
