"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useProjectSlug } from "./navigation";
import { FaRegLightbulb } from "react-icons/fa6";
import {
  FaBluesky,
  FaInstagram,
  FaGithub,
  FaHackerNews,
  FaLinkedinIn,
  FaRedditAlien,
  FaThreads,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

// projects.list resolves the stored icon into a URL for rendering.
export type Project = Doc<"projects"> & { iconUrl: string | null };

// Where we look for posts. Only reddit + hn have live fetchers today; the
// rest are wired as the pipeline grows.
export const PLATFORM_OPTIONS = [
  { id: "hn", label: "Hacker News", Icon: FaHackerNews, bg: "#FF6600", fg: "#ffffff", live: true },
  { id: "reddit", label: "Reddit", Icon: FaRedditAlien, bg: "#FF4500", fg: "#ffffff", live: true },
  { id: "indiehackers", label: "Indie Hackers", Icon: FaRegLightbulb, bg: "#0E2439", fg: "#ffffff", live: true },
  { id: "x", label: "X / Twitter", Icon: FaXTwitter, bg: "#ffffff", fg: "#000000", live: true },
  { id: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn, bg: "#0A66C2", fg: "#ffffff", live: true },
  { id: "youtube", label: "YouTube", Icon: FaYoutube, bg: "#FF0000", fg: "#ffffff", live: true },
  { id: "bluesky", label: "Bluesky", Icon: FaBluesky, bg: "#0085FF", fg: "#ffffff", live: true },
  { id: "threads", label: "Threads", Icon: FaThreads, bg: "#ffffff", fg: "#000000", live: false },
  { id: "github", label: "GitHub", Icon: FaGithub, bg: "#ffffff", fg: "#000000", live: true },
  { id: "instagram", label: "Instagram", Icon: FaInstagram, bg: "#E4405F", fg: "#ffffff", live: false },
  { id: "tiktok", label: "TikTok", Icon: FaTiktok, bg: "#ffffff", fg: "#000000", live: false },
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
      lockedKeywords?: string[];
      communities?: string[];
      instagramAccounts?: string[];
      tiktokAccounts?: string[];
      xAccounts?: string[];
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

  const router = useRouter();
  const pathname = usePathname();
  const slug = useProjectSlug();

  const list = projects ?? [];
  // The URL decides which project is open; nothing else can disagree with it.
  // Account pages carry no slug, so fall back to the last one used there.
  const project =
    (slug
      ? list.find((p) => p.slug === slug)
      : (list.find((p) => p._id === me?.lastProjectId) ?? list[0])) ?? null;

  // Keep the same sub-page when switching projects: /analytics stays there.
  const subPath = (() => {
    if (!slug || !pathname) return "";
    const rest = pathname.replace(`/dashboard/${slug}`, "");
    return rest === "/" ? "" : rest;
  })();

  const goToProject = (nextSlug: string) => {
    router.push(`/dashboard/${nextSlug}${subPath}`);
  };

  const setProjectId = (id: Id<"projects">) => {
    const target = list.find((p) => p._id === id);
    if (!target) return;
    setLastProject({ projectId: id }).catch(console.error);
    goToProject(target.slug);
  };

  const addProject = async (name: string) => {
    const id = await create({ name });
    setLastProject({ projectId: id }).catch(console.error);
    // The new project's slug comes back on the next projects.list update, so
    // route by name-derived slug the server would have produced.
    const slugified =
      name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
      "project";
    router.push(`/dashboard/${slugified}/settings`);
    return id;
  };

  const removeProject = async (id: Id<"projects">) => {
    await remove({ projectId: id });
    const next = list.find((p) => p._id !== id);
    if (next) goToProject(next.slug);
    else router.push("/dashboard");
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
