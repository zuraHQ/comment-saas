"use client";

import DashboardLayout from "./dashboard-layout";
import { DashboardNavigationProvider } from "./components/astrix/navigation";
import { PostsContent } from "./components/astrix/posts-content";
import { ThemeProvider } from "./components/astrix/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

function DashboardRoute() {
  return (
    <DashboardLayout>
      <PostsContent />
    </DashboardLayout>
  );
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
