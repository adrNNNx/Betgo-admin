import type { MatchLevel } from "@/lib/pozo/types"

/** Carriles de la tragaperras. Coincide con REELS del backend. */
export const REELS = 5

const choose = (n: number, k: number): number => {
  let r = 1
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1)
  return r
}

/**
 * Probabilidad de que un símbolo con probabilidad `p` por carril salga en al
 * menos `k` de los 5 carriles.
 *
 * Es binomial exacta: cada carril se sortea independiente (así lo hace el
 * backend), y con k >= 3 el símbolo más repetido es único, así que no hay
 * empates que corregir.
 */
export function probAtLeast(p: number, k: number): number {
  if (p <= 0) return 0
  let sum = 0
  for (let i = k; i <= REELS; i++) {
    sum += choose(REELS, i) * p ** i * (1 - p) ** (REELS - i)
  }
  return sum
}

/**
 * Cada cuántas jugadas paga un símbolo, dado su peso sobre el total.
 * Devuelve null si nunca paga (probabilidad 0).
 */
export function spinsPerWin(
  weight: number,
  totalWeight: number,
  minMatch: MatchLevel
): number | null {
  const p = probAtLeast(weight / (totalWeight || 1), minMatch)
  return p > 0 ? Math.round(1 / p) : null
}

/** "1 cada 217 jugadas" — o el aviso si es tan raro que no vale la pena. */
export function formatOdds(spins: number | null): string {
  if (spins === null) return "nunca"
  if (spins <= 1) return "casi todas las jugadas"
  return `1 cada ${spins.toLocaleString("es-PY")} jugadas`
}

/**
 * Cada cuántas jugadas paga *algo* el conjunto de símbolos.
 *
 * La suma es exacta, no una aproximación: con 3 o más iguales sólo puede haber
 * un símbolo repetido esa cantidad de veces en 5 carriles, así que los eventos
 * son disjuntos y las probabilidades se suman sin solaparse.
 */
export function combinedSpinsPerWin(
  symbols: { weight: number; minMatch: MatchLevel; pays: boolean }[]
): number | null {
  const total = symbols.reduce((a, s) => a + s.weight, 0) || 1
  const p = symbols
    .filter((s) => s.pays)
    .reduce((acc, s) => acc + probAtLeast(s.weight / total, s.minMatch), 0)
  return p > 0 ? Math.round(1 / p) : null
}

/** Qué tan seguido sale, para pintar el aviso. */
export type OddsLevel = "extremo" | "alto" | "normal" | "raro"

export function oddsLevel(spins: number | null): OddsLevel {
  if (spins === null) return "raro"
  if (spins <= 10) return "extremo"
  if (spins <= 50) return "alto"
  if (spins <= 5000) return "normal"
  return "raro"
}

/**
 * Lo mismo, pero para el pozo global, que se mide con otra vara: el pozo se
 * acumula de a poco y se vacía entero, así que un símbolo pesado lo deja sin
 * tiempo de crecer. Con peso 30% el pozo se vacía 1 cada 418 jugadas; con 9%,
 * 1 cada 140.000.
 */
export function jackpotOddsLevel(spins: number | null): OddsLevel {
  if (spins === null) return "raro"
  if (spins < 1000) return "extremo"
  if (spins < 20000) return "alto"
  return "normal"
}
