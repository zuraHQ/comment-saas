"use client";

import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import DashboardLayout from "./dashboard-layout";
import { AuthGate } from "./components/astrix/auth-gate";
import { OnboardingContent } from "./components/astrix/onboarding-content";
import { FeedFilterProvider } from "./components/astrix/feed-filter";
import { ProjectProvider, useProject } from "./components/astrix/project-context";
import { ThemeProvider } from "./components/astrix/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const ONBOARDED_HINT_KEY = "onboarded";

// Everything every dashboard route needs: auth, theme, project state, and the
// onboarding gate that replaces the whole shell for new users.
function Gate({ children }: { children: ReactNode }) {
  const me = useQuery(api.users.me);

  // Remembered answer so returning users skip the blank wait entirely; read in
  // a layout effect so the correction happens before the browser paints.
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

  return (
    <DashboardLayout>
      <ProjectGuard>{children}</ProjectGuard>
    </DashboardLayout>
  );
}

// A slug that does not belong to this user should say so, not render blanks.
function ProjectGuard({ children }: { children: ReactNode }) {
  const { project, projects, loading } = useProject();
  const pathname = usePathname();
  const isProjectRoute = /^\/dashboard\/[^/]+/.test(pathname ?? "");

  if (!isProjectRoute || loading || project) return <>{children}</>;
  if (!projects.length) return <>{children}</>;

  return (
    <div className="p-6 text-sm text-muted-foreground">
      That project does not exist. Pick one from the switcher above.
    </div>
  );
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <TooltipProvider>
        <ThemeProvider>
          <ProjectProvider>
            <FeedFilterProvider>
              <Gate>{children}</Gate>
            </FeedFilterProvider>
          </ProjectProvider>
        </ThemeProvider>
      </TooltipProvider>
    </AuthGate>
  );
}
