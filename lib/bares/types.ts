export type BarStatus = "active" | "inactive"

export type Distribution = {
  /** % que se queda el bar */
  bar: number
  /** % que va al pozo nacional */
  pozo: number
  /** % que va a la empresa */
  empresa: number
}

export type BarSymbol = {
  id: string
  name: string
  /** emoji o URL de imagen */
  emoji: string
  /** peso/probabilidad relativa en la máquina */
  weight: number
  /**
   * Desde cuántos carriles iguales este símbolo paga su premio (3, 4 o 5).
   * 5 = sólo con los cinco, que es la conducta histórica.
   */
  minMatch: 3 | 4 | 5
  hasPrize: boolean
  /** Nombre del premio asignado, para mostrarlo sin re-buscar. */
  prizeName: string | null
  /** Si entrega el pozo global. Sólo los símbolos globales pueden. */
  isJackpot: boolean
}

export type Bar = {
  id: string
  name: string
  slug: string
  location: string | null
  /** saldo disponible en guaraníes (PYG) */
  balance: number
  freePlaysPerDay: number
  distribution: Distribution
  status: BarStatus
  /** URL de la imagen custom, o null si usa SELO.png */
  imageUrl: string | null
  symbols: BarSymbol[]
}
