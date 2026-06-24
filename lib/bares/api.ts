import "server-only"

import { apiFetch } from "@/lib/session"
import type { Bar, BarSymbol } from "@/lib/bares/types"

// Shape crudo que devuelve Betgo-backend (entidad Bar). Los decimales pueden
// venir como string desde Sequelize, por eso el Number(...) en el mapeo.
type RawBar = {
  id: string
  name: string
  slug: string
  address: string | null
  balance: number | string
  freePlaysPerDay: number
  barPercentage: number | string
  poolPercentage: number | string
  platformPercentage: number | string
  logoUrl: string | null
  isActive: boolean
}

// El símbolo del backend guarda la imagen/emoji en `imageUrl` (string) y el
// "tiene premio" se deriva de prizeId.
type RawSymbol = {
  id: string
  name: string
  imageUrl: string
  weight: number
  barId: string | null
  prizeId: string | null
  isActive: boolean
}

function toSymbol(s: RawSymbol): BarSymbol {
  return {
    id: s.id,
    name: s.name,
    emoji: s.imageUrl,
    weight: s.weight,
    hasPrize: s.prizeId !== null,
  }
}

function toBar(r: RawBar, symbols: BarSymbol[]): Bar {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    location: r.address || null,
    balance: Number(r.balance) || 0,
    freePlaysPerDay: r.freePlaysPerDay,
    distribution: {
      bar: Number(r.barPercentage) || 0,
      pozo: Number(r.poolPercentage) || 0,
      empresa: Number(r.platformPercentage) || 0,
    },
    status: r.isActive ? "active" : "inactive",
    imageUrl: r.logoUrl || null,
    symbols,
  }
}

export type PlatformKpis = {
  totalPlatformEarnings: number
  totalPoolCollected: number
  bars: { id: string; name: string; platformEarnings: number; poolContributed: number }[]
}

// KPIs derivados del ledger (GET /bars/admin/kpis). Sin rango = acumulado
// histórico. Si falla, devolvemos ceros para no romper la página de bares.
export async function getPlatformKpis(): Promise<PlatformKpis> {
  const res = await apiFetch("/bars/admin/kpis")
  if (!res.ok) {
    return { totalPlatformEarnings: 0, totalPoolCollected: 0, bars: [] }
  }
  return (await res.json()) as PlatformKpis
}

export async function getBars(): Promise<Bar[]> {
  // includeInactive=true → traemos activos y desactivados; el estado se gestiona
  // (activar/desactivar) desde la tabla, no se borra nada.
  //
  // Una sola pasada por /symbols y agrupamos por barId, en vez de N llamadas a
  // /symbols/bar/:id. Sólo nos quedamos con los locales (barId != null) activos:
  // los globales (jackpot/pozo) se administran aparte, no en el config por bar.
  const [barsRes, symbolsRes] = await Promise.all([
    apiFetch("/bars?includeInactive=true"),
    apiFetch("/symbols"),
  ])
  if (!barsRes.ok) throw new Error("No se pudieron cargar los bares")

  const rawBars = (await barsRes.json()) as RawBar[]
  const rawSymbols = symbolsRes.ok
    ? ((await symbolsRes.json()) as RawSymbol[])
    : []

  const byBar = new Map<string, BarSymbol[]>()
  for (const s of rawSymbols) {
    if (!s.barId || !s.isActive) continue
    const list = byBar.get(s.barId) ?? []
    list.push(toSymbol(s))
    byBar.set(s.barId, list)
  }

  return rawBars.map((b) => toBar(b, byBar.get(b.id) ?? []))
}
