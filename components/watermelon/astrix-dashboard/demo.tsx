"use client";

import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
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
import { ProfileContent } from "./components/astrix/profile-content";
import { ProjectSettingsContent } from "./components/astrix/project-settings-content";
import { ProjectProvider } from "./components/astrix/project-context";
import { FeedFilterProvider } from "./components/astrix/feed-filter";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ThemeProvider } from "./components/astrix/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const ONBOARDED_HINT_KEY = "onboarded";

function DashboardRoute() {
  const { pathname } = useDashboardNavigation();
  const me = useQuery(api.users.me);

  // Remember the answer so returning users skip the blank wait entirely. Read
  // in a layout effect so the correction happens before the browser paints.
  const [hint, setHint] = useState(false);
  useLayoutEffect(() => {
    try {
      setHint(localStorage.getItem(ONBOARDED_HINT_KEY) === "1");
    } catch {
      // ignore blocked storage
    }
  }, []);

  useEffect(() => {
    if (me === undefined) return;
    try {
      if (me?.onboardedAt) localStorage.setItem(ONBOARDED_HINT_KEY, "1");
      else localStorage.removeItem(ONBOARDED_HINT_KEY);
    } catch {
      // ignore blocked storage
    }
  }, [me]);

  // `me === null` means the row has not been written yet, so it is not an
  // onboarded user: keep waiting instead of flashing the dashboard at them.
  const settled = me !== undefined && me !== null;
  if (!settled && !hint) return <div className="min-h-screen bg-background" />;
  if (settled && !me.onboardedAt) return <OnboardingContent />;

  let content: ReactNode = <PostsContent />;
  if (pathname === "/analytics") content = <AnalyticsContent />;
  else if (pathname === "/launchpad") content = <LaunchpadContent />;
  else if (pathname === "/settings") content = <ProjectSettingsContent />;
  else if (pathname === "/profile") content = <ProfileContent />;

  return <DashboardLayout>{content}</DashboardLayout>;
}

export default function AstrixDashboardDemo() {
  return (
    <AuthGate>
      <TooltipProvider>
      <ThemeProvider>
        <DashboardNavigationProvider>
          <ProjectProvider>
            <FeedFilterProvider>
            <DashboardRoute />
            </FeedFilterProvider>
          </ProjectProvider>
        </DashboardNavigationProvider>
      </ThemeProvider>
      </TooltipProvider>
    </AuthGate>
  );
}
