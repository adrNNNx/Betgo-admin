// Configuración estática del módulo Pozo global: filtros, montos rápidos y catálogo de emojis.

import type { MovementType } from "@/lib/pozo/types"

/** Filtros del historial. `adjust` agrupa sumas y restas manuales. */
export const HISTORY_FILTERS: { value: MovementType | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "game_spin", label: "Jugadas" },
  { value: "topup", label: "Recargas" },
  { value: "adjust", label: "Ajustes" },
  { value: "payout", label: "Pagos" },
]

/** Chips de monto rápido para la acción manual. */
export const QUICK_AMOUNTS = [5000, 10000, 50000, 100000]

/** Chips de costo rápido por tirada. */
export const QUICK_COSTS = [1000, 2000, 5000, 10000]

/** Cuántos movimientos se muestran por página en el historial. */
export const HISTORY_PAGE_SIZE = 50

/**
 * Peso mínimo por símbolo. El backend valida `@Min(1)`: un símbolo con peso 0
 * no puede existir, así que la UI no debe dejar llegar a ese valor.
 */
export const MIN_SYMBOL_WEIGHT = 1

/** Peso máximo permitido por símbolo. */
export const MAX_SYMBOL_WEIGHT = 50

/** Emojis sugeridos al crear un símbolo. */
export const SYMBOL_EMOJIS = [
  "🎰", "🍒", "🍊", "🔔", "🍀", "🍺",
  "💰", "⭐", "💎", "👑", "🪙", "⚡",
  "🍇", "🃏", "🥇", "7️⃣",
]
