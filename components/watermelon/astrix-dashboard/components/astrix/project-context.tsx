"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

// projects.list resolves the stored icon into a URL for rendering.
export type Project = Doc<"projects"> & { iconUrl: string | null };

// Where we look for posts. Only reddit + hn have live fetchers today; the
// rest are wired as the pipeline grows.
export const PLATFORM_OPTIONS = [
  { id: "reddit", label: "Reddit", live: true },
  { id: "hn", label: "Hacker News", live: true },
  { id: "x", label: "X / Twitter", live: false },
  { id: "linkedin", label: "LinkedIn", live: false },
  { id: "youtube", label: "YouTube", live: false },
  { id: "bluesky", label: "Bluesky", live: false },
  { id: "threads", label: "Threads", live: false },
  { id: "github", label: "GitHub", live: false },
  { id: "quora", label: "Quora", live: false },
] as const;

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
      url?: string;
      description?: string;
      keywords?: string[];
      platforms?: string[];
      iconId?: Id<"_storage">;
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
    const id = await create({ name });
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
