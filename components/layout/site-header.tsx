"use client"

import { Fragment } from "react"
import { usePathname } from "next/navigation"
import { Bell, Search } from "lucide-react"

import { allNavItems } from "@/config/nav"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

/** Resuelve el título de la página actual desde la config de navegación. */
function useCurrentTitle() {
  const pathname = usePathname()
  const match = allNavItems.find(
    (item) => pathname === item.url || pathname.startsWith(`${item.url}/`)
  )
  return match?.title ?? "Inicio"
}

export function SiteHeader() {
  const current = useCurrentTitle()

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-5" />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/dashboard">Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <Fragment>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{current}</BreadcrumbPage>
            </BreadcrumbItem>
          </Fragment>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Search />
          <span className="sr-only">Buscar</span>
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell />
          <span className="sr-only">Notificaciones</span>
        </Button>
      </div>
    </header>
  )
}
