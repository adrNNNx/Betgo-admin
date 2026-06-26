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
  inactive: {
    label: "Desactivado",
    className: "border-transparent bg-muted text-muted-foreground",
  },
}

export const STATUS_FILTERS: { value: BarStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Desactivados" },
]

/** Colores de cada segmento de la distribución (Bar / Pozo / Empresa). */
export const DISTRIBUTION_COLORS = {
  bar: "bg-slate-600",
  pozo: "bg-blue-500",
  empresa: "bg-amber-400",
} as const

export const FREE_PLAYS_MAX = 10
export const MAX_IMAGE_MB = 3 // alineado con el límite del backend (3MB)
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/gif,image/webp"

/** Peso máximo permitido para un símbolo de la máquina (backend admite hasta 1000). */
export const SYMBOL_WEIGHT_MAX = 100

/** Emojis sugeridos en el selector rápido al crear/editar un símbolo. */
export const SYMBOL_EMOJIS = [
  "🍀", "🍺", "🎰", "🔔", "💰", "⭐", "🍒", "🍋",
  "💎", "👑", "🪙", "⚡", "🍇", "🃏", "🥨", "⚓",
] as const

/** Opciones de orden para la grilla/lista de símbolos. */
export const SYMBOL_SORTS = [
  { value: "weight-desc", label: "Mayor probabilidad" },
  { value: "weight-asc", label: "Menor probabilidad" },
  { value: "name", label: "Nombre (A–Z)" },
  { value: "prize", label: "Con premio primero" },
] as const

export type SymbolSortKey = (typeof SYMBOL_SORTS)[number]["value"]
