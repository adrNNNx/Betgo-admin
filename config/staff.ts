import type { StaffRole, StaffStatus } from "@/lib/staff/types"

/**
 * Metadatos de estado. `dotClassName` pinta el punto del badge; el badge usa
 * `className` (tokens de tu globals.css, soporta dark mode).
 */
export const STAFF_STATUS: Record<
  StaffStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Activo",
    className:
      "border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  inactive: {
    label: "Inactivo",
    className: "border-transparent bg-muted text-muted-foreground",
  },
  suspended: {
    label: "Suspendido",
    className:
      "border-transparent bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
}

/**
 * Metadatos de rol. `icon` es el nombre del ícono de lucide que renderiza
 * `staff-role-cell.tsx`. Las clases pintan el cuadradito del ícono.
 */
export const STAFF_ROLE: Record<
  StaffRole,
  { label: string; icon: string; chipClassName: string }
> = {
  mozo: {
    label: "Mozo",
    icon: "HandPlatter",
    chipClassName: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  },
  encargado: {
    label: "Encargado",
    icon: "ClipboardList",
    chipClassName:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
  },
  admin_bar: {
    label: "Admin. de bar",
    icon: "Shield",
    chipClassName: "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300",
  },
}

export const ROLE_FILTERS: { value: StaffRole | "all"; label: string }[] = [
  { value: "all", label: "Todos los roles" },
  { value: "mozo", label: "Mozo" },
  { value: "encargado", label: "Encargado" },
  { value: "admin_bar", label: "Admin. de bar" },
]

export const STATUS_FILTERS: { value: StaffStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
  { value: "suspended", label: "Suspendidos" },
]

/** Orden de roles para selects de alta/edición. */
export const ROLE_OPTIONS: StaffRole[] = ["mozo", "encargado", "admin_bar"]
export const STATUS_OPTIONS: StaffStatus[] = ["active", "inactive", "suspended"]
