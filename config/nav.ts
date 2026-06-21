import {
  LayoutDashboard,
  Store,
  Grid2x2,
  Users,
  Gift,
  ArrowLeftRight,
  Trophy,
  type LucideIcon,
} from "lucide-react"

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
  roles?: string[]
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
      { title: "Mesas", url: "/mesas", icon: Grid2x2 },
      { title: "Mozos", url: "/mozos", icon: Users },
      { title: "Premios", url: "/premios", icon: Gift },
      { title: "Transacciones", url: "/transacciones", icon: ArrowLeftRight },
      { title: "Pozo", url: "/pozo", icon: Trophy },
    ],
  },
]

/** Todos los ítems aplanados (útil para resolver breadcrumbs por pathname). */
export const allNavItems: NavItem[] = navigation.flatMap((g) => g.items)
