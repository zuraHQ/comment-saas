import ProjectRedirect from "@/components/watermelon/astrix-dashboard/project-redirect";

// /dashboard has no project of its own: send people to the one they last used.
export default function DashboardIndexPage() {
  return <ProjectRedirect />;
}
