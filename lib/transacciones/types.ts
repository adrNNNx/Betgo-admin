// Dominio de Transacciones, alineado con la tabla `transactions` del backend.

/** Tipos crudos del backend. */
export type TransactionType =
  | "recharge"
  | "play_free"
  | "play_paid"
  | "play_pool"
  | "prize_local"
  | "prize_jackpot"
  | "bar_recharge"
  | "platform_revenue"
  | "staff_allocation"
  | "staff_return"
  | "adjustment"

/** Agrupación legible para badges y filtros. */
export type TransactionCategory =
  | "play"
  | "recharge"
  | "prize"
  | "revenue"
  | "allocation"
  | "adjust"

export type Transaction = {
  id: string
  /** `reference` del backend, o un fallback con el id corto. */
  ref: string
  /** ISO date-time (createdAt). */
  timestamp: string
  type: TransactionType
  category: TransactionCategory
  /** Monto total del movimiento (siempre positivo). El color/efecto se deriva del tipo. */
  amount: number
  barId: string | null
  barName: string | null
  /** Nombre del mozo/staff (solo recargas lo tienen). */
  mozoName: string | null
  playerId: string | null
  playerName: string | null
  /** Método de pago del backend (solo recargas), o null. */
  method: string | null
  balanceBefore: number | null
  balanceAfter: number | null
  note: string | null
}

export type BarOption = { id: string; name: string }

export type TransactionFilters = {
  query: string
  /** id de bar, o "all" */
  barId: string
  /** categoría, o "all" */
  category: TransactionCategory | "all"
  /** yyyy-mm-dd o null */
  from: string | null
  /** yyyy-mm-dd o null */
  to: string | null
}

export type TypeTotals = Record<string, { count: number; total: number }>

/** Agregados sobre el conjunto filtrado (server-side). */
export type TransactionSummary = {
  count: number
  total: number
  average: number
  byType: TypeTotals
}

export const DEFAULT_FILTERS: TransactionFilters = {
  query: "",
  barId: "all",
  category: "all",
  from: null,
  to: null,
}
