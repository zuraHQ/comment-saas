"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Project = {
  id: string;
  name: string;
  color: string;
};

// Mock projects until onboarding + Convex store the user's real ones.
export const PROJECTS: Project[] = [
  { id: "acme", name: "Acme", color: "#A3FF12" },
  { id: "nimbus", name: "Nimbus CRM", color: "#0085FF" },
  { id: "pixelkit", name: "PixelKit", color: "#FF4500" },
];

type ProjectContextValue = {
  project: Project;
  setProjectId: (id: string) => void;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectId, setProjectId] = useState(PROJECTS[0].id);
  const project = PROJECTS.find((p) => p.id === projectId) ?? PROJECTS[0];

  return (
    <ProjectContext.Provider value={{ project, setProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}
