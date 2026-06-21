export type BarStatus = "active" | "draft" | "paused"

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
  hasPrize: boolean
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
