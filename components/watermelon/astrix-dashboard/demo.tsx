"use client";

import type { ReactNode } from "react";
import DashboardLayout from "./dashboard-layout";
import { ClassificationContent } from "./components/astrix/classification-content";
import {
  DashboardNavigationProvider,
  useDashboardNavigation,
} from "./components/astrix/navigation";
import { ThemeProvider } from "./components/astrix/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

function DashboardRoute() {
  const { pathname } = useDashboardNavigation();

  let content: ReactNode = null;

  if (pathname === "/classification") {
    content = <ClassificationContent />;
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
