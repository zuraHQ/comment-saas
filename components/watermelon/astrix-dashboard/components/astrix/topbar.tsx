import { Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PROJECTS, useProject } from "./project-context";

export function DashboardTopbar() {
  const { project, setProjectId } = useProject();

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b px-4 md:px-6 md:pr-8">
      <SidebarTrigger className="size-10 md:hidden [&_svg]:size-5!" />

      <div className="ml-auto flex shrink-0 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className="flex h-10 items-center gap-2.5 border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-sidebar-accent"
            aria-label="Switch project"
          >
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center text-[10px] font-bold text-[#101010]"
              style={{ backgroundColor: project.color }}
            >
              {project.name[0]}
            </span>
            {project.name}
            <ChevronsUpDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            collisionPadding={16}
            className="astrix-dashboard w-56"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Projects</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PROJECTS.map((p) => (
                <DropdownMenuItem key={p.id} onSelect={() => setProjectId(p.id)}>
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center text-[10px] font-bold text-[#101010]"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.name[0]}
                  </span>
                  <span className="flex-1">{p.name}</span>
                  {p.id === project.id ? <Check className="size-4" /> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <Plus className="size-4" />
              New project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
