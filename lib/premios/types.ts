// Dominio de Premios (alineado con el backend: prizes + symbols).

export type PrizeType = "local" | "jackpot"
export type PrizeStatus = "active" | "inactive"
export type ScopeType = "global" | "bar"

/**
 * Un premio configurable dentro de un ámbito (un bar, o el pozo nacional).
 * `type` lo deriva el backend del ámbito (bar → local, global → jackpot).
 */
export interface Prize {
  id: string
  name: string
  type: PrizeType
  /** Valor estimado en Gs. `null` = sin valor. Referencia interna. */
  value: number | null
  /** Stock disponible. `null` = ilimitado. */
  stock: number | null
  status: PrizeStatus
  desc: string
  /** Imagen del premio (Cloudinary), o null. */
  imageUrl: string | null
}

/**
 * Símbolo de la tragamonedas. Se crean en la sección "Símbolos"; aquí solo se
 * les asigna un premio (backend: symbol.prizeId → prize).
 */
export interface SlotSymbol {
  id: string
  name: string
  /** Emoji o URL de imagen propia. */
  emoji: string
  /** Peso relativo → probabilidad sobre el total del ámbito. */
  weight: number
  /** Premio que otorga. `null` = sin asignar. */
  prizeId: string | null
}

/** Ámbito: un bar concreto, o el pozo nacional (global, barId = null). */
export interface Scope {
  /** `"global"` para el pozo, o el UUID del bar. */
  id: string
  type: ScopeType
  name: string
  location: string
  /** UUID del bar, o null para el pozo global (lo usa el alta de premios). */
  barId: string | null
  /** Logo del bar (Cloudinary), o null. El pozo global no tiene logo. */
  imageUrl: string | null
  symbols: SlotSymbol[]
  prizes: Prize[]
}
