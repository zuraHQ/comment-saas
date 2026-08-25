"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

export type Project = Doc<"projects">;

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

type ProjectContextValue = {
  projects: Project[];
  project: Project | null;
  loading: boolean;
  setProjectId: (id: Id<"projects">) => void;
  addProject: (name: string) => Promise<Id<"projects">>;
  updateProject: (
    id: Id<"projects">,
    patch: {
      name?: string;
      color?: string;
      url?: string;
      description?: string;
      keywords?: string[];
      postTypes?: string[];
    },
  ) => Promise<void>;
  removeProject: (id: Id<"projects">) => Promise<void>;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const projects = useQuery(api.projects.list);
  const me = useQuery(api.users.me);
  const create = useMutation(api.projects.create);
  const update = useMutation(api.projects.update);
  const remove = useMutation(api.projects.remove);
  const setLastProject = useMutation(api.users.setLastProject);

  // Selection this session; falls back to the one Convex remembered for us.
  const [pickedId, setPickedId] = useState<Id<"projects"> | null>(null);

  const list = projects ?? [];
  const selectedId = pickedId ?? me?.lastProjectId ?? null;
  const project = list.find((p) => p._id === selectedId) ?? list[0] ?? null;

  const setProjectId = (id: Id<"projects">) => {
    setPickedId(id);
    setLastProject({ projectId: id }).catch(console.error);
  };

  const addProject = async (name: string) => {
    const color = PROJECT_COLORS[list.length % PROJECT_COLORS.length];
    const id = await create({ name, color });
    setProjectId(id);
    return id;
  };

  const removeProject = async (id: Id<"projects">) => {
    await remove({ projectId: id });
    const next = list.find((p) => p._id !== id);
    if (next) setProjectId(next._id);
    else setPickedId(null);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects: list,
        project,
        loading: projects === undefined,
        setProjectId,
        addProject,
        updateProject: async (id, patch) => {
          await update({ projectId: id, ...patch });
        },
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
