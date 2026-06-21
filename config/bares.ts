import type { BarStatus } from "@/lib/bares/types"

export const BAR_STATUS: Record<
  BarStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Activo",
    // verde sutil
    className:
      "border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  draft: {
    label: "Borrador",
    className:
      "border-transparent bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-500",
  },
  paused: {
    label: "Pausado",
    className: "border-transparent bg-muted text-muted-foreground",
  },
}

export const STATUS_FILTERS: { value: BarStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "draft", label: "Borrador" },
  { value: "paused", label: "Pausados" },
]

/** Colores de cada segmento de la distribución (Bar / Pozo / Empresa). */
export const DISTRIBUTION_COLORS = {
  bar: "bg-slate-600",
  pozo: "bg-blue-500",
  empresa: "bg-amber-400",
} as const

export const FREE_PLAYS_MAX = 10
export const MAX_IMAGE_MB = 5
