"use client"

import { ChevronsUpDown, LogOut, UserRound } from "lucide-react"

import { logout } from "@/app/login/actions"
import { ROLE_LABELS, type SessionUser } from "@/lib/auth"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function NavUser({ user }: { user: SessionUser }) {
  const { isMobile } = useSidebar()
  const displayName = user.name ?? user.phone
  const roleLabel = ROLE_LABELS[user.role] ?? user.role

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-md">
                <AvatarFallback className="rounded-md bg-primary text-primary-foreground text-xs">
                  {initials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {roleLabel}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="grid gap-0.5">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {roleLabel}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserRound />
              Mi perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={logout}>
              <button type="submit" className="w-full">
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut />
                  Cerrar sesión
                </DropdownMenuItem>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
