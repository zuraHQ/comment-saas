"use client";

import { useState, type FormEvent } from "react";
import { Check, Lock, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useDashboardNavigation } from "./navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProjectIcon } from "./project-icon";
import { PLATFORM_OPTIONS, useProject, type Project } from "./project-context";

export function ProjectSettingsContent() {
  const { project } = useProject();

  if (!project) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Create a project first, from the project switcher above.
      </div>
    );
  }

  // Keyed on the project id so switching projects remounts with fresh fields
  // instead of syncing state in an effect.
  return <ProjectSettingsForm key={project._id} project={project} />;
}

function ProjectSettingsForm({ project }: { project: Project }) {
  const { projects, updateProject, removeProject } = useProject();
  const { navigate } = useDashboardNavigation();

  const [name, setName] = useState(project.name);
  const [url, setUrl] = useState(project.url ?? "");
  const [description, setDescription] = useState(project.description ?? "");
  const [keyword, setKeyword] = useState("");
  const [community, setCommunity] = useState("");
  const [fbPage, setFbPage] = useState("");
  const [igAccount, setIgAccount] = useState("");
  const [ttAccount, setTtAccount] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploading, setUploading] = useState(false);

  const generateUploadUrl = useMutation(api.projects.generateIconUploadUrl);
  const clearIcon = useMutation(api.projects.clearIcon);

  // Upload straight to Convex storage, then save the returned id on the project.
  const uploadIcon = async (file: File) => {
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl({});
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const { storageId } = await res.json();
      await updateProject(project._id, { iconId: storageId });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const addKeyword = (e: FormEvent) => {
    e.preventDefault();
    const value = keyword.trim().toLowerCase();
    if (!value || project.keywords.includes(value)) {
      setKeyword("");
      return;
    }
    void updateProject(project._id, { keywords: [...project.keywords, value] });
    setKeyword("");
  };

  const lockedKeywords = new Set(project.lockedKeywords ?? []);

  const removeKeyword = (value: string) => {
    if (lockedKeywords.has(value)) return; // ours, not removable
    void updateProject(project._id, {
      keywords: project.keywords.filter((k) => k !== value),
    });
  };

  const addCommunity = (e: FormEvent) => {
    e.preventDefault();
    const value = community
      .trim()
      .toLowerCase()
      .replace(/^\/?r\//, "")
      .replace(/\/$/, "");
    if (!value || project.communities.includes(value)) {
      setCommunity("");
      return;
    }
    void updateProject(project._id, {
      communities: [...project.communities, value],
    });
    setCommunity("");
  };

  const removeCommunity = (value: string) => {
    void updateProject(project._id, {
      communities: project.communities.filter((c) => c !== value),
    });
  };

  const addToList = (
    field: "facebookPages" | "instagramAccounts" | "tiktokAccounts",
    raw: string,
    reset: () => void,
  ) => {
    const value = raw.trim();
    reset();
    if (!value) return;
    const current = project[field] ?? [];
    void updateProject(project._id, { [field]: [...current, value] });
  };

  const removeFromList = (
    field: "facebookPages" | "instagramAccounts" | "tiktokAccounts",
    value: string,
  ) => {
    void updateProject(project._id, {
      [field]: (project[field] ?? []).filter((x) => x !== value),
    });
  };

  const togglePlatform = (id: string) => {
    const next = project.platforms.includes(id)
      ? project.platforms.filter((t) => t !== id)
      : [...project.platforms, id];
    void updateProject(project._id, { platforms: next });
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          Settings for:
          <ProjectIcon project={project} className="h-6 w-6 text-xs" />
          {project.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Each project is one product. Its keywords and post types decide which
          posts land in your feed.
        </p>
      </div>

      <Section title="Project">
        <Field label="Name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() =>
              void updateProject(project._id, { name: name.trim() || project.name })
            }
            className="rounded-none"
          />
        </Field>
        <Field label="Product URL">
          <Input
            value={url}
            placeholder="https://yourproduct.com"
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => void updateProject(project._id, { url: url.trim() })}
            className="rounded-none"
          />
        </Field>
        <Field
          label="What it does"
          hint="One or two lines. Used to judge how relevant a post is."
        >
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => void updateProject(project._id, { description })}
            rows={3}
            placeholder="Lightweight CRM for small sales teams."
            className="w-full resize-none border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring"
          />
        </Field>
        <Field label="Icon" hint="Square image, shown in the project switcher.">
          <div className="flex items-center gap-3">
            <ProjectIcon project={project} className="h-10 w-10 text-sm" />
            <label className="h-9 cursor-pointer border border-border px-4 text-xs font-bold leading-9 tracking-wider text-muted-foreground uppercase transition-colors hover:bg-sidebar-accent hover:text-foreground">
              {uploading ? "Uploading..." : project.iconUrl ? "Replace" : "Upload"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void uploadIcon(file);
                }}
              />
            </label>
            {project.iconUrl ? (
              <button
                type="button"
                onClick={() => void clearIcon({ projectId: project._id })}
                className="h-9 cursor-pointer border border-border px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:border-red-500/40 hover:text-red-400"
              >
                Remove
              </button>
            ) : null}
          </div>
        </Field>
      </Section>

      <Section
        title="Platforms"
        subtitle="Where we look for posts. We surface any post type that fits your keywords."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {PLATFORM_OPTIONS.map((platform) => {
            const on = project.platforms.includes(platform.id);
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => togglePlatform(platform.id)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 border p-3 text-left text-sm transition-colors",
                  on
                    ? "border-primary/40 bg-sidebar-accent/40"
                    : "border-border hover:bg-sidebar-accent/60",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center border transition-colors",
                    on ? "border-primary bg-primary" : "border-border",
                  )}
                >
                  {on ? <Check className="size-4 text-[#101010]" /> : null}
                </span>
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center"
                  style={{ backgroundColor: platform.bg }}
                >
                  <platform.Icon
                    className="h-3.5 w-3.5"
                    style={{ color: platform.fg }}
                  />
                </span>
                <span className="flex-1">{platform.label}</span>
                {!platform.live ? (
                  <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
                    soon
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Reddit communities" platform="reddit">
        <form onSubmit={addCommunity} className="flex gap-2">
          <Input
            value={community}
            onChange={(e) => setCommunity(e.target.value)}
            placeholder="r/smallbusiness"
            className="rounded-none"
          />
          <button
            type="submit"
            className="h-9 shrink-0 cursor-pointer border border-border px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            Add
          </button>
        </form>

        {project.communities.length ? (
          <div className="flex flex-wrap gap-2">
            {project.communities.map((c) => (
              <span
                key={c}
                className="flex items-center gap-2 border border-border px-3 py-1.5 text-sm"
              >
                r/{c}
                <button
                  type="button"
                  onClick={() => removeCommunity(c)}
                  aria-label={`Remove r/${c}`}
                  className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No communities yet. Add the subreddits your customers hang out in.
          </p>
        )}
      </Section>

      <Section title="Facebook pages" platform="facebook">
        <p className="text-sm text-muted-foreground">
          We watch the comment sections of these pages. Add pages your
          customers follow, competitors included.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addToList("facebookPages", fbPage, () => setFbPage(""));
          }}
          className="flex gap-2"
        >
          <Input
            value={fbPage}
            onChange={(e) => setFbPage(e.target.value)}
            placeholder="facebook.com/shopify or shopify"
            className="rounded-none"
          />
          <button
            type="submit"
            className="h-9 shrink-0 cursor-pointer border border-border px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            Add
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {(project.facebookPages ?? []).map((page) => (
            <span
              key={page}
              className="flex items-center gap-2 border border-border px-3 py-1.5 text-sm"
            >
              {page}
              <button
                type="button"
                onClick={() => removeFromList("facebookPages", page)}
                aria-label={`Remove ${page}`}
                className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      </Section>

      <Section title="Instagram accounts" platform="instagram">
        <p className="text-sm text-muted-foreground">
          Same idea: we read the comments under these accounts&apos; posts.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addToList("instagramAccounts", igAccount, () => setIgAccount(""));
          }}
          className="flex gap-2"
        >
          <Input
            value={igAccount}
            onChange={(e) => setIgAccount(e.target.value)}
            placeholder="@shopify"
            className="rounded-none"
          />
          <button
            type="submit"
            className="h-9 shrink-0 cursor-pointer border border-border px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            Add
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {(project.instagramAccounts ?? []).map((account) => (
            <span
              key={account}
              className="flex items-center gap-2 border border-border px-3 py-1.5 text-sm"
            >
              @{account}
              <button
                type="button"
                onClick={() => removeFromList("instagramAccounts", account)}
                aria-label={`Remove ${account}`}
                className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      </Section>

      <Section title="TikTok accounts" platform="tiktok">
        <p className="text-sm text-muted-foreground">
          We read the comments under these accounts&apos; latest videos.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addToList("tiktokAccounts", ttAccount, () => setTtAccount(""));
          }}
          className="flex gap-2"
        >
          <Input
            value={ttAccount}
            onChange={(e) => setTtAccount(e.target.value)}
            placeholder="@shopify"
            className="rounded-none"
          />
          <button
            type="submit"
            className="h-9 shrink-0 cursor-pointer border border-border px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            Add
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {(project.tiktokAccounts ?? []).map((account) => (
            <span
              key={account}
              className="flex items-center gap-2 border border-border px-3 py-1.5 text-sm"
            >
              @{account}
              <button
                type="button"
                onClick={() => removeFromList("tiktokAccounts", account)}
                aria-label={`Remove ${account}`}
                className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      </Section>

      <Section
        title="Keywords"
        subtitle={`${project.keywords.length} tracked. A wide net across each platform, outside your communities.`}
      >
        <form onSubmit={addKeyword} className="flex gap-2">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. hubspot alternative"
            className="rounded-none"
          />
          <button
            type="submit"
            className="h-9 shrink-0 cursor-pointer border border-border px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            Add
          </button>
        </form>

        {project.keywords.length ? (
          <div className="flex flex-wrap gap-2">
            {project.keywords.map((k) =>
              lockedKeywords.has(k) ? (
                <span
                  key={k}
                  title="Picked from your site"
                  className="flex items-center gap-2 border border-border px-3 py-1.5 text-sm text-muted-foreground"
                >
                  <Lock className="size-3" />
                  {k}
                </span>
              ) : (
                <span
                  key={k}
                  className="flex items-center gap-2 border border-border px-3 py-1.5 text-sm"
                >
                  {k}
                  <button
                    type="button"
                    onClick={() => removeKeyword(k)}
                    aria-label={`Remove ${k}`}
                    className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ),
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No keywords yet. Add the phrases people use when they need your product.
          </p>
        )}
      </Section>

      <Section title="Danger zone">
        {projects.length > 1 ? (
          confirmDelete ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm">
                Delete <span className="text-primary">{project.name}</span> and its
                settings?
              </p>
              <button
                type="button"
                onClick={async () => {
                  await removeProject(project._id);
                  navigate("/");
                }}
                className="h-9 cursor-pointer border border-red-500/40 px-4 text-xs font-bold tracking-wider text-red-400 uppercase transition-colors hover:bg-red-500/10"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="h-9 cursor-pointer border border-border px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:bg-sidebar-accent hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex h-9 w-fit cursor-pointer items-center gap-2 border border-border px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:border-red-500/40 hover:text-red-400"
            >
              <Trash2 className="size-3.5" />
              Delete project
            </button>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            This is your only project. Create another one before deleting it.
          </p>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  platform,
  children,
}: {
  title: string;
  subtitle?: string;
  platform?: string;
  children: React.ReactNode;
}) {
  const meta = platform
    ? PLATFORM_OPTIONS.find((option) => option.id === platform)
    : undefined;
  return (
    <section className="flex flex-col gap-4 border border-border p-5">
      <div>
        <h2 className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          {meta ? (
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center"
              style={{ backgroundColor: meta.bg }}
            >
              <meta.Icon className="h-3 w-3" style={{ color: meta.fg }} />
            </span>
          ) : null}
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
