"use client";

import type { ReactNode } from "react";
import DashboardLayout from "./dashboard-layout";
import { AnalyticsContent } from "./components/astrix/analytics-content";
import { AuthGate } from "./components/astrix/auth-gate";
import { OnboardingContent } from "./components/astrix/onboarding-content";
import { LaunchpadContent } from "./components/astrix/launchpad-content";
import {
  DashboardNavigationProvider,
  useDashboardNavigation,
} from "./components/astrix/navigation";
import { PostsContent } from "./components/astrix/posts-content";
import { ProjectSettingsContent } from "./components/astrix/project-settings-content";
import { ProjectProvider } from "./components/astrix/project-context";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ThemeProvider } from "./components/astrix/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

function DashboardRoute() {
  const { pathname } = useDashboardNavigation();
  const me = useQuery(api.users.me);

  // Nothing until we know: avoids flashing the dashboard at a brand new user.
  if (me === undefined) return <div className="min-h-screen bg-background" />;
  if (me && !me.onboardedAt) return <OnboardingContent />;

  let content: ReactNode = <PostsContent />;
  if (pathname === "/analytics") content = <AnalyticsContent />;
  else if (pathname === "/launchpad") content = <LaunchpadContent />;
  else if (pathname === "/settings") content = <ProjectSettingsContent />;

  return <DashboardLayout>{content}</DashboardLayout>;
}

export default function AstrixDashboardDemo() {
  return (
    <AuthGate>
      <TooltipProvider>
      <ThemeProvider>
        <DashboardNavigationProvider>
          <ProjectProvider>
            <DashboardRoute />
          </ProjectProvider>
        </DashboardNavigationProvider>
      </ThemeProvider>
      </TooltipProvider>
    </AuthGate>
  );
}
