// Tipos del módulo Pozo global.

/** Tipo de movimiento sobre la porción de pozo global. */
export type MovementType = "game_spin" | "topup" | "adjust" | "payout"

export type PoolMovement = {
  id: string
  /** ISO date-time del movimiento. */
  at: string
  type: MovementType
  /** Impacto sobre el pozo global (positivo suma, negativo resta). */
  poolDelta: number
  /** Monto total de la operación (ej. la recarga completa antes de repartir). */
  total: number
  /** Reparto de la recarga hacia el bar (solo `topup`). */
  barShare?: number
  /** Reparto de la recarga hacia la empresa (solo `topup`). */
  companyShare?: number
  notes?: string | null
}

export type GlobalSymbol = {
  id: string
  name: string
  /** Emoji usado cuando no hay imagen propia. */
  emoji: string
  /** URL de imagen propia; si existe se muestra en vez del emoji. */
  imageUrl?: string | null
  /** Peso relativo. Probabilidad = weight / suma(weights). */
  weight: number
  /** Si al alinearse otorga un premio del pozo. */
  hasPrize: boolean
  /** Premio asignado (backend: symbol.prizeId). null = sin asignar. */
  prizeId: string | null
  /** Nombre del premio asignado, para mostrarlo sin re-buscar. */
  prizeName: string | null
}

export type PoolState = {
  /** Saldo vigente del pozo global (PYG). */
  amount: number
  /** Costo por tirada de la tragaperras del pozo (PYG). */
  costPerSpin: number
  /** Contribuciones acumuladas (jugadas + recargas + ajustes positivos). */
  contributions: number
  /** Pagos a ganadores + ajustes negativos. */
  payouts: number
  /** ISO date-time del último ajuste. */
  lastAdjustAt: string
}

/** Dirección de un ajuste manual. */
export type AdjustDirection = "add" | "sub"
