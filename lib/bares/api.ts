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
  minMatchToWin?: number | string
  isJackpot?: boolean
  barId: string | null
  prizeId: string | null
  isActive: boolean
  prize?: { id: string; name: string } | null
}

function toSymbol(s: RawSymbol): BarSymbol {
  const min = Number(s.minMatchToWin)
  return {
    id: s.id,
    name: s.name,
    emoji: s.imageUrl,
    weight: s.weight,
    // Cualquier valor fuera de 3/4 cae a 5 (sólo con los cinco).
    minMatch: min === 3 || min === 4 ? min : 5,
    hasPrize: s.prizeId !== null,
    prizeName: s.prize?.name ?? null,
    isJackpot: s.isJackpot === true,
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
export async function getPlatformKpis(range?: {
  from?: string
  to?: string
}): Promise<PlatformKpis> {
  const qs = new URLSearchParams()
  if (range?.from) qs.set("from", range.from)
  if (range?.to) qs.set("to", range.to)
  const suffix = qs.toString() ? `?${qs}` : ""
  const res = await apiFetch(`/bars/admin/kpis${suffix}`)
  if (!res.ok) {
    return { totalPlatformEarnings: 0, totalPoolCollected: 0, bars: [] }
  }
  return (await res.json()) as PlatformKpis
}

export type BarsWithReel = {
  bars: Bar[]
  /**
   * Símbolos globales activos. Están en la máquina de TODOS los bares: el motor
   * arma la tirada con `barId IS NULL OR barId = :bar`. Hacen falta acá para que
   * la probabilidad de un símbolo del bar salga sobre el total real de la
   * máquina y no sólo sobre los propios (que la infla muchísimo).
   */
  globalSymbols: BarSymbol[]
}

/** Bares + los símbolos globales que comparten. Una sola pasada por /symbols. */
export async function getBarsWithReel(): Promise<BarsWithReel> {
  // includeInactive=true → traemos activos y desactivados; el estado se gestiona
  // (activar/desactivar) desde la tabla, no se borra nada.
  //
  // Una sola pasada por /symbols: agrupamos los locales por barId y apartamos
  // los globales, en vez de N llamadas a /symbols/bar/:id.
  //
  // ponytail: traemos TODOS los bares y TODOS los símbolos; la tabla y la grilla
  // paginan en el cliente. Techo: ~200-300 bares (a ~10 símbolos/bar, /symbols
  // pesa ~1MB y revienta antes que la lista de bares, que a 1000 bares son ~500KB).
  // Al cruzar ese umbral, en este orden: (1) símbolos del bar seleccionado
  // (GET /symbols?barId=), (2) endpoint propio de tabla paginado
  // (GET /bars/admin/table). NO paginar GET /bars: el rail de símbolos, mozos,
  // premios y transacciones necesitan la lista completa.
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
  const globalSymbols: BarSymbol[] = []
  for (const s of rawSymbols) {
    if (!s.isActive) continue
    if (!s.barId) {
      globalSymbols.push(toSymbol(s))
      continue
    }
    const list = byBar.get(s.barId) ?? []
    list.push(toSymbol(s))
    byBar.set(s.barId, list)
  }

  return {
    bars: rawBars.map((b) => toBar(b, byBar.get(b.id) ?? [])),
    globalSymbols,
  }
}

/** Sólo los bares. Los módulos que no configuran la máquina usan esto. */
export async function getBars(): Promise<Bar[]> {
  return (await getBarsWithReel()).bars
}
