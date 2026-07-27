import {
  LayoutDashboard,
  Store,
  Users,
  Gift,
  ArrowLeftRight,
  Trophy,
  GalleryHorizontalEnd,
  type LucideIcon,
} from "lucide-react"

import { canAccess, type Role } from "@/lib/auth"

/**
 * Fuente única de verdad de la navegación del panel.
 * Para agregar un módulo nuevo, sumá un objeto acá: el sidebar,
 * los breadcrumbs y cualquier menú se actualizan solos.
 */
export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  /** Roles que pueden ver el ítem. Vacío/undefined = todos. */
  roles?: Role[]
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const navigation: NavGroup[] = [
  {
    label: "Plataforma",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Bares", url: "/bares", icon: Store },
      { title: "Mozos", url: "/mozos", icon: Users },
      { title: "Premios", url: "/premios", icon: Gift },
      { title: "Banners", url: "/banners", icon: GalleryHorizontalEnd },
      { title: "Transacciones", url: "/transacciones", icon: ArrowLeftRight },
      { title: "Pozo", url: "/pozo", icon: Trophy },
    ],
  },
]

/** Todos los ítems aplanados (útil para resolver breadcrumbs por pathname). */
export const allNavItems: NavItem[] = navigation.flatMap((g) => g.items)

/** Navegación recortada al rol: oculta ítems no permitidos y grupos vacíos. */
export function filterNavByRole(groups: NavGroup[], role: Role): NavGroup[] {
  return groups
    .map((g) => ({ ...g, items: g.items.filter((i) => canAccess(role, i.roles)) }))
    .filter((g) => g.items.length > 0)
}
