"use client"

import Link from "next/link"

import { navigation, filterNavByRole } from "@/config/nav"
import type { SessionUser } from "@/lib/auth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"

export function AppSidebar({
  user,
  pendingJackpots = 0,
}: {
  user: SessionUser
  /** Pozos ganados sin pagar. Es la única señal de que alguien ganó. */
  pendingJackpots?: number
}) {
  // El filtrado vive acá (client): la nav lleva componentes de icono que no son
  // serializables, así que no pueden cruzar la frontera server→client por props.
  const groups = filterNavByRole(navigation, user.role)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
                  B
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">BetGO Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain groups={groups} badges={{ jackpots: pendingJackpots }} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
