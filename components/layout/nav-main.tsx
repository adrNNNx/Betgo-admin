"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import type { NavGroup } from "@/config/nav"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  groups,
  badges,
}: {
  groups: NavGroup[]
  /** Contadores por clave de `NavItem.badge`. 0 = no se muestra. */
  badges?: Partial<Record<NonNullable<NavGroup["items"][number]["badge"]>, number>>
}) {
  const pathname = usePathname()

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => {
              const isActive =
                pathname === item.url || pathname.startsWith(`${item.url}/`)
              const count = item.badge ? (badges?.[item.badge] ?? 0) : 0
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={
                      count > 0 ? `${item.title} · ${count} sin pagar` : item.title
                    }
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                      {count > 0 && (
                        <SidebarMenuBadge className="bg-red-500 text-white">
                          {count}
                        </SidebarMenuBadge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}
