"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Project = {
  id: string;
  name: string;
  color: string;
  url: string;
  description: string;
  keywords: string[];
  postTypes: string[];
};

// What kind of posts a project wants surfaced. Feeds the intent scorer.
export const POST_TYPES = [
  { id: "asking-recommendation", label: "Asking for a recommendation" },
  { id: "looking-alternative", label: "Looking for an alternative" },
  { id: "complaining-competitor", label: "Complaining about a competitor" },
  { id: "how-do-i", label: "Asking how to do something" },
  { id: "sharing-problem", label: "Sharing a problem we solve" },
  { id: "hiring-outsourcing", label: "Hiring or outsourcing the job" },
] as const;

export const PROJECT_COLORS = [
  "#A3FF12",
  "#0085FF",
  "#FF4500",
  "#FF6600",
  "#B92B27",
  "#00C48C",
];

const PROJECTS_STORAGE_KEY = "projects";

// Seed projects until onboarding writes real ones to Convex.
export const PROJECTS: Project[] = [
  {
    id: "acme",
    name: "Acme",
    color: "#A3FF12",
    url: "https://acme.dev",
    description: "Reply marketing tool for founders.",
    keywords: ["reply marketing", "find customers", "reddit marketing"],
    postTypes: ["asking-recommendation", "looking-alternative"],
  },
  {
    id: "nimbus",
    name: "Nimbus CRM",
    color: "#0085FF",
    url: "https://nimbus.crm",
    description: "Lightweight CRM for small sales teams.",
    keywords: ["crm recommendation", "hubspot alternative"],
    postTypes: ["asking-recommendation", "complaining-competitor"],
  },
  {
    id: "pixelkit",
    name: "PixelKit",
    color: "#FF4500",
    url: "https://pixelkit.design",
    description: "UI kit for design engineers.",
    keywords: ["ui kit", "design system template"],
    postTypes: ["asking-recommendation", "how-do-i"],
  },
];

type ProjectContextValue = {
  projects: Project[];
  project: Project;
  setProjectId: (id: string) => void;
  addProject: (name: string) => Project;
  updateProject: (id: string, patch: Partial<Omit<Project, "id">>) => void;
  removeProject: (id: string) => void;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "project"
  );
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [projectId, setProjectId] = useState(PROJECTS[0].id);

  // Loaded after mount so the server-rendered HTML matches the first client render.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Project[];
        if (Array.isArray(parsed) && parsed.length) {
          setProjects(parsed);
          setProjectId(parsed[0].id);
        }
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  const persist = (next: Project[]) => {
    setProjects(next);
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  };

  const project = projects.find((p) => p.id === projectId) ?? projects[0];

  const addProject = (name: string) => {
    const base = slugify(name);
    let id = base;
    let n = 2;
    while (projects.some((p) => p.id === id)) id = `${base}-${n++}`;

    const created: Project = {
      id,
      name: name.trim() || "New project",
      color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length],
      url: "",
      description: "",
      keywords: [],
      postTypes: [],
    };
    persist([...projects, created]);
    setProjectId(created.id);
    return created;
  };

  const updateProject = (id: string, patch: Partial<Omit<Project, "id">>) => {
    persist(projects.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removeProject = (id: string) => {
    const next = projects.filter((p) => p.id !== id);
    if (!next.length) return; // always keep at least one project
    persist(next);
    if (id === projectId) setProjectId(next[0].id);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        project,
        setProjectId,
        addProject,
        updateProject,
        removeProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}
