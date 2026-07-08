import "server-only"

import { apiFetch } from "@/lib/session"
import type { Prize, PrizeStatus, PrizeType, Scope, SlotSymbol } from "@/lib/premios/types"

type RawPrize = {
  id: string
  barId: string | null
  name: string
  description: string | null
  type: PrizeType
  value: number | string | null
  stock: number | null
  imageUrl: string | null
  isActive: boolean
}

type RawSymbol = {
  id: string
  name: string
  imageUrl: string
  weight: number
  barId: string | null
  prizeId: string | null
  isActive: boolean
}

type RawBar = {
  id: string
  name: string
  slug: string
  address: string | null
  logoUrl: string | null
}

function toPrize(p: RawPrize): Prize {
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    value: p.value === null ? null : Number(p.value),
    stock: p.stock ?? null,
    status: (p.isActive ? "active" : "inactive") as PrizeStatus,
    desc: p.description ?? "",
    imageUrl: p.imageUrl ?? null,
  }
}

function toSymbol(s: RawSymbol): SlotSymbol {
  return {
    id: s.id,
    name: s.name,
    emoji: s.imageUrl,
    weight: s.weight,
    prizeId: s.prizeId,
  }
}

/**
 * Ámbitos de premios: el pozo nacional (global, barId = null) primero y luego
 * cada bar, cada uno con sus premios y símbolos. Una sola pasada por /prizes y
 * /symbols agrupando por barId, en vez de N llamadas por bar.
 */
export async function getScopes(): Promise<Scope[]> {
  const [barsRes, prizesRes, symbolsRes] = await Promise.all([
    apiFetch("/bars?includeInactive=true"),
    apiFetch("/prizes"),
    apiFetch("/symbols"),
  ])
  if (!barsRes.ok) throw new Error("No se pudieron cargar los bares")
  if (!prizesRes.ok) throw new Error("No se pudieron cargar los premios")

  const rawBars = (await barsRes.json()) as RawBar[]
  const rawPrizes = (await prizesRes.json()) as RawPrize[]
  const rawSymbols = symbolsRes.ok ? ((await symbolsRes.json()) as RawSymbol[]) : []

  // Agrupamos por barId; la clave "global" junta lo que tiene barId = null.
  const GLOBAL = "global"
  const key = (barId: string | null) => barId ?? GLOBAL

  const prizesBy = new Map<string, Prize[]>()
  for (const p of rawPrizes) {
    const k = key(p.barId)
    ;(prizesBy.get(k) ?? prizesBy.set(k, []).get(k)!).push(toPrize(p))
  }

  const symbolsBy = new Map<string, SlotSymbol[]>()
  for (const s of rawSymbols) {
    if (!s.isActive) continue
    const k = key(s.barId)
    ;(symbolsBy.get(k) ?? symbolsBy.set(k, []).get(k)!).push(toSymbol(s))
  }

  const globalScope: Scope = {
    id: GLOBAL,
    type: "global",
    name: "Pozo nacional",
    location: "Premios jackpot de toda la red",
    barId: null,
    imageUrl: null,
    symbols: symbolsBy.get(GLOBAL) ?? [],
    prizes: prizesBy.get(GLOBAL) ?? [],
  }

  const barScopes: Scope[] = rawBars.map((b) => ({
    id: b.id,
    type: "bar",
    name: b.name,
    location: b.address ?? "Sin ubicación",
    barId: b.id,
    imageUrl: b.logoUrl ?? null,
    symbols: symbolsBy.get(b.id) ?? [],
    prizes: prizesBy.get(b.id) ?? [],
  }))

  return [globalScope, ...barScopes]
}
