import { FaDiscord } from "react-icons/fa";
import { AccountMenu } from "./account-menu";
import { AstrixLogo } from "./logo";
import { SidebarToggleIcon } from "./icons";
import { DashboardLink, useDashboardNavigation } from "./navigation";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  launchNavigation,
  workspaceNavigation,
  type NavigationItem,
} from "../../data";
import { cn } from "@/lib/utils";

function NavItem({ item }: { item: NavigationItem }) {
  const { pathname } = useDashboardNavigation();
  const { isMobile, setOpenMobile } = useSidebar();
  const isActive =
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.name}
        className={cn(
          "h-auto [&_svg]:size-5",
          "group-data-[collapsible=icon]:size-12!",
          "group-data-[collapsible=icon]:px-3.5!",
        )}
      >
        <DashboardLink
          href={item.href}
          aria-current={isActive ? "page" : undefined}
          onClick={() => {
            if (isMobile) setOpenMobile(false);
          }}
          className={cn(
            "group/nav flex h-12 w-full items-center gap-2.5 overflow-hidden rounded-xl px-3 py-2.5 text-muted-foreground hover:text-foreground",
            "transition-[width,padding] ease-linear",
            "aria-[current=page]:bg-sidebar-accent aria-[current=page]:text-primary aria-[current=page]:[filter:var(--shadow-sidebar-item)]",
          )}
        >
          <item.icon className="size-5" />
          <span className="truncate text-base group-data-[collapsible=icon]:hidden">
            {item.name}
          </span>
          {item.badge ? (
            <span className="ml-auto rounded-md bg-foreground/10 px-1.5 py-0.5 text-xs font-medium text-foreground group-data-[collapsible=icon]:hidden group-aria-[current=page]/nav:bg-primary/10 group-aria-[current=page]/nav:text-primary">
              {item.badge}
            </span>
          ) : null}
        </DashboardLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function DashboardSidebar() {
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="h-16 flex-row items-center justify-between px-3 transition-[padding] ease-linear group-data-[collapsible=icon]:px-4.25">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden group-data-[collapsible=icon]:hidden">
          <AstrixLogo />
          <span className="truncate text-xl font-medium">ASTRIX</span>
        </div>
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={toggleSidebar}
          className="ml-auto text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:size-12"
        >
          <SidebarToggleIcon className="size-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden px-3 py-4 transition-[padding] ease-linear group-data-[collapsible=icon]:px-4.25">
        <SidebarMenu className="gap-3">
          {workspaceNavigation.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </SidebarMenu>

        <SidebarGroupLabel className="mt-4 px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase group-data-[collapsible=icon]:hidden">
          Launch
        </SidebarGroupLabel>
        <SidebarMenu className="gap-3">
          {launchNavigation.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </SidebarMenu>

        <SidebarGroupLabel className="mt-4 px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase group-data-[collapsible=icon]:hidden">
          Community
        </SidebarGroupLabel>
        <SidebarMenu className="gap-3">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Discord"
              className={cn(
                "h-auto [&_svg]:size-5",
                "group-data-[collapsible=icon]:size-12!",
                "group-data-[collapsible=icon]:px-3.5!",
              )}
            >
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "flex h-12 w-full items-center gap-2.5 overflow-hidden rounded-xl px-3 py-2.5 text-muted-foreground hover:text-foreground",
                  "transition-[width,padding] ease-linear",
                )}
              >
                <FaDiscord className="size-5" />
                <span className="truncate text-base group-data-[collapsible=icon]:hidden">
                  Discord
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>

        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-3 py-2 transition-[padding] ease-linear group-data-[collapsible=icon]:px-5.25">
        <SidebarMenu>
          <SidebarMenuItem>
            <AccountMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
