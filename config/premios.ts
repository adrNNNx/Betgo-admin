import type { PrizeStatus, PrizeType } from "@/lib/premios/types"

export const PRIZE_TYPE_FILTERS: { value: PrizeType | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "local", label: "Local" },
  { value: "jackpot", label: "Jackpot" },
]

export const PRIZE_STATUS_FILTERS: { value: PrizeStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
]

/** Umbral de aviso de stock bajo (alineado con helpers.stockInfo). */
export const LOW_STOCK_THRESHOLD = 5

// Reutilizamos los límites de imagen del módulo de bares (mismo backend).
export { MAX_IMAGE_MB, IMAGE_ACCEPT } from "@/config/bares"
