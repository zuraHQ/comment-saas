"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ProjectRedirect() {
  const router = useRouter();
  const projects = useQuery(api.projects.list);
  const me = useQuery(api.users.me);

  useEffect(() => {
    if (!projects?.length) return;
    const last = projects.find((p) => p._id === me?.lastProjectId);
    router.replace(`/dashboard/${(last ?? projects[0]).slug}`);
  }, [projects, me, router]);

  return <div className="min-h-screen bg-background" />;
}
