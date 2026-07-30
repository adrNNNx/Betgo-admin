import type { BarSymbol } from "@/lib/bares/types"

export type SymbolWithProbability = BarSymbol & { probability: number }

/**
 * El campo `emoji` de un símbolo puede contener un emoji *o* la URL/ruta de una
 * imagen propia del bar (ver types.ts). Esta función detecta el segundo caso
 * para renderizar un <img> en lugar de texto.
 */
export function isImageSrc(value: string): boolean {
  return (
    /^(https?:\/\/|\/|data:image\/)/.test(value) ||
    /\.(png|jpe?g|gif|webp|svg)$/i.test(value)
  )
}

export function totalWeight(symbols: BarSymbol[]): number {
  return symbols.reduce((sum, s) => sum + (s.weight || 0), 0)
}

/**
 * Anota cada símbolo con su probabilidad real de salir en un carril.
 *
 * `extraWeight` es el peso de los símbolos globales, que están en la máquina de
 * todos los bares (el motor arma la tirada con `barId IS NULL OR barId = :bar`).
 * Sin eso el porcentaje sale calculado sólo sobre los símbolos propios y queda
 * inflado: un bar con dos símbolos vería 81% donde la realidad es 28%.
 */
export function withProbabilities(
  symbols: BarSymbol[],
  extraWeight = 0
): SymbolWithProbability[] {
  const total = totalWeight(symbols) + extraWeight || 1
  return symbols.map((s) => ({ ...s, probability: (s.weight / total) * 100 }))
}

export function formatProbability(p: number): string {
  return (p >= 10 ? Math.round(p).toString() : p.toFixed(1)) + "%"
}
