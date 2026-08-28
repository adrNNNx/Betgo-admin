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
  /**
   * Desde cuántos carriles iguales este símbolo paga su premio.
   * 3 o 4 = premio menor (físico, lo entrega el bar); 5 = sólo con los cinco.
   */
  minMatch: MatchLevel
  /**
   * Si al alinear los 5 entrega el POZO GLOBAL. Lo elige el admin: el pozo es
   * plata compartida, así que no se deriva de nada.
   */
  isJackpot: boolean
  /** Si al alinearse otorga un premio del pozo. */
  hasPrize: boolean
  /** Premio asignado (backend: symbol.prizeId). null = sin asignar. */
  prizeId: string | null
  /** Nombre del premio asignado, para mostrarlo sin re-buscar. */
  prizeName: string | null
}

/** Desde cuántos carriles iguales paga un símbolo. */
export type MatchLevel = 3 | 4 | 5

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

// --- Pozos ganados (pago manual) ------------------------------------------

/**
 * `pending_contact` → el ganador todavía no escribió.
 * `in_review`       → ya escribió y espera el pago: es el que pide acción.
 * `paid`            → transferido. Terminal, no hay vuelta atrás.
 */
export type JackpotClaimStatus = "pending_contact" | "in_review" | "paid"

/**
 * Comprobante de un pozo global ganado. El pozo NO se acredita al saldo: se
 * emite este folio y administración transfiere a mano.
 */
export type JackpotClaim = {
  id: string
  /** Folio que el ganador manda por WhatsApp: J-XXXXXX */
  folio: string
  amount: number
  status: JackpotClaimStatus
  /** ISO date-time de cuándo lo ganó. */
  playedAt: string
  /** ISO date-time de cuándo se comunicó, o null si todavía no. */
  contactedAt: string | null
  paidAt: string | null
  barName: string | null
  playerName: string | null
  playerPhone: string | null
}

/** Lo que alimenta el badge del panel. */
export type JackpotPendingCount = {
  total: number
  pendingContact: number
  inReview: number
  /** Plata que la empresa debe hoy. */
  amountOwed: number
}

// --- Premios mayores ------------------------------------------------------

export type ClaimStatus = "pending" | "delivered" | "expired"

/**
 * Comprobante de un premio mayor (`type: jackpot` del catálogo: iPhone, autos,
 * montos grandes). El mozo no puede entregarlos, los autoriza un admin.
 *
 * OJO: no tiene nada que ver con ganar el pozo global. El pozo se acredita solo
 * al saldo del jugador y no genera comprobante; que el tipo de premio se llame
 * "jackpot" es coincidencia de nombre.
 */
export type MajorClaim = {
  id: string
  /** Código que trae el jugador: P-XXXXXXXX */
  claimCode: string
  prizeName: string
  /** Valor en Gs. Suele venir null: el monto está en el nombre del premio. */
  prizeValue: number | null
  prizeImageUrl: string | null
  playerName: string | null
  playerPhone: string | null
  barId: string | null
  barName: string | null
  /** ISO date-time de emisión. */
  createdAt: string
  /** ISO date-time de vencimiento. Vencido = ya no se puede entregar. */
  expiresAt: string
}
