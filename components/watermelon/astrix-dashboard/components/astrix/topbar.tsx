import { BellIcon } from "./icons";
import { buttonVariants } from "@/components/ui/button";
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
import { notifications } from "../../data";

export function DashboardTopbar() {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b px-4 md:px-6 md:pr-8">
      <SidebarTrigger className="size-10 md:hidden [&_svg]:size-5!" />
      <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className={buttonVariants({
              variant: "secondary",
              size: "icon-lg",
              className: "size-10",
            })}
            aria-label="Notifications"
          >
            <span className="relative">
              <BellIcon className="size-5" />
              <span className="absolute top-0 right-0.5 size-2 rounded-full bg-destructive" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            collisionPadding={16}
            className="astrix-dashboard w-78"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="min-w-0 items-start py-2"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{notification.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      {notification.time}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center hover:underline focus:bg-transparent">
              View all
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
