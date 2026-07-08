import type { Prize, Scope, SlotSymbol } from "@/lib/premios/types"

/** El símbolo guarda un emoji o una URL de imagen; detecta el segundo caso. */
export function isImageSrc(value: string): boolean {
  return /^(https?:\/\/|\/|data:image\/)/.test(value)
}

export const formatPct = (p: number): string =>
  (p >= 10 ? Math.round(p).toString() : p.toFixed(1)) + "%"

// --- Consultas sobre un ámbito -------------------------------------------

export const symTotal = (scope: Scope): number =>
  scope.symbols.reduce((a, s) => a + s.weight, 0) || 1

export const unassignedSymbols = (scope: Scope): SlotSymbol[] =>
  scope.symbols.filter((s) => !s.prizeId)

/** Símbolos que otorgan un premio dado (backend es 1 premio → N símbolos). */
export const symbolsForPrize = (scope: Scope, prizeId: string): SlotSymbol[] =>
  scope.symbols.filter((s) => s.prizeId === prizeId)

export const prizeById = (scope: Scope, id: string | null): Prize | null =>
  scope.prizes.find((p) => p.id === id) ?? null

// --- Estado de stock ------------------------------------------------------

export type StockLevel = "inf" | "ok" | "low" | "out"
export interface StockInfo {
  level: StockLevel
  label: string
}

export function stockInfo(p: Prize): StockInfo {
  if (p.stock === null) return { level: "inf", label: "Ilimitado" }
  if (p.stock === 0) return { level: "out", label: "Agotado" }
  if (p.stock < 5) return { level: "low", label: `${p.stock} · bajo` }
  return { level: "ok", label: String(p.stock) }
}

export function stockShort(p: Prize): string {
  if (p.stock === null) return "stock ilimitado"
  if (p.stock === 0) return "agotado"
  if (p.stock < 5) return `stock ${p.stock} (bajo)`
  return `stock ${p.stock}`
}

export const isCritical = (p: Prize): boolean =>
  p.stock !== null && p.stock < 5 && p.status === "active"

// --- Agregados para los KPIs ----------------------------------------------

export interface Summary {
  total: number
  active: number
  inactive: number
  unassigned: number
  critical: number
  scopes: number
}

export function summarize(scopes: Scope[]): Summary {
  let total = 0
  let active = 0
  let unassigned = 0
  let critical = 0
  for (const sc of scopes) {
    for (const p of sc.prizes) {
      total++
      if (p.status === "active") active++
      if (isCritical(p)) critical++
    }
    unassigned += unassignedSymbols(sc).length
  }
  return {
    total,
    active,
    inactive: total - active,
    unassigned,
    critical,
    scopes: scopes.length,
  }
}
