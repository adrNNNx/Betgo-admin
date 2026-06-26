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
 * Anota cada símbolo con su probabilidad real de salir en un rodillo:
 * peso del símbolo / suma de todos los pesos. El peso por sí solo no significa
 * nada; sólo importa relativo al total, por eso lo exponemos como %.
 */
export function withProbabilities(symbols: BarSymbol[]): SymbolWithProbability[] {
  const total = totalWeight(symbols) || 1
  return symbols.map((s) => ({ ...s, probability: (s.weight / total) * 100 }))
}

export function formatProbability(p: number): string {
  return (p >= 10 ? Math.round(p).toString() : p.toFixed(1)) + "%"
}
