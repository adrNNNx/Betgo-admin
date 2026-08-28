import "server-only"

import { apiFetch } from "@/lib/session"
import type {
  ClaimStatus,
  GlobalSymbol,
  JackpotClaim,
  JackpotClaimStatus,
  JackpotPendingCount,
  MajorClaim,
  MatchLevel,
  MovementType,
  PoolMovement,
  PoolState,
} from "@/lib/pozo/types"
import type { Prize, PrizeStatus, PrizeType } from "@/lib/premios/types"

const isImageSrc = (v: string) => /^(https?:\/\/|\/|data:image\/)/.test(v)

const EMPTY_POOL: PoolState = {
  amount: 0,
  costPerSpin: 0,
  contributions: 0,
  payouts: 0,
  lastAdjustAt: new Date().toISOString(),
}

type RawPool = {
  currentAmount?: number | string
  costPerPlay?: number | string
  totalCollected?: number | string
  totalPaid?: number | string
  updatedAt?: string
}

/** Normaliza el umbral a 3/4/5; cualquier otra cosa cae a 5. */
function toMatchLevel(v: unknown): MatchLevel {
  const n = Number(v)
  return n === 3 || n === 4 ? n : 5
}

/**
 * Estado del pozo global (GET /global-pool, público). Cae a ceros solo si el
 * pozo aún no está configurado / la respuesta no tiene la forma esperada.
 */
export async function getPoolState(): Promise<PoolState> {
  try {
    const res = await apiFetch("/global-pool")
    if (!res.ok) return EMPTY_POOL
    const data = (await res.json()) as unknown
    const raw = (Array.isArray(data) ? data[0] : data) as RawPool | undefined
    if (!raw || raw.currentAmount === undefined) return EMPTY_POOL
    return {
      amount: Number(raw.currentAmount) || 0,
      costPerSpin: Number(raw.costPerPlay) || 0,
      contributions: Number(raw.totalCollected) || 0,
      payouts: Number(raw.totalPaid) || 0,
      lastAdjustAt: raw.updatedAt ?? new Date().toISOString(),
    }
  } catch {
    return EMPTY_POOL
  }
}

type RawJackpotClaim = {
  id: string
  folio: string
  amount: number | string
  status: JackpotClaimStatus
  playedAt: string
  contactedAt: string | null
  paidAt: string | null
  // El backend manda `bar: null` si el claim quedó sin bar, y omite `user`
  // cuando no lo incluyó en la consulta.
  bar?: { id: string; name: string } | null
  user?: { id: string; name: string | null; phone: string | null } | null
}

export type JackpotClaimsPage = { data: JackpotClaim[]; total: number }

const EMPTY_COUNT: JackpotPendingCount = {
  total: 0,
  pendingContact: 0,
  inReview: 0,
  amountOwed: 0,
}

function toJackpotClaim(r: RawJackpotClaim): JackpotClaim {
  return {
    id: r.id,
    folio: r.folio,
    amount: Number(r.amount) || 0,
    status: r.status,
    playedAt: r.playedAt,
    contactedAt: r.contactedAt ?? null,
    paidAt: r.paidAt ?? null,
    barName: r.bar?.name ?? null,
    playerName: r.user?.name ?? null,
    playerPhone: r.user?.phone ?? null,
  }
}

/** Pozos ganados (GET /jackpot-claims). Sin `status` trae todos. */
export async function getJackpotClaims(params: {
  status?: JackpotClaimStatus
  limit: number
  offset: number
}): Promise<JackpotClaimsPage> {
  const qs = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  })
  if (params.status) qs.set("status", params.status)

  try {
    const res = await apiFetch(`/jackpot-claims?${qs.toString()}`)
    if (!res.ok) return { data: [], total: 0 }
    const json = (await res.json()) as {
      data?: RawJackpotClaim[]
      total?: number
    } | null
    if (!json || !Array.isArray(json.data)) return { data: [], total: 0 }
    return {
      data: json.data.map(toJackpotClaim),
      total: json.total ?? json.data.length,
    }
  } catch {
    return { data: [], total: 0 }
  }
}

/**
 * Contador del badge (GET /jackpot-claims/pending-count).
 *
 * Es la ÚNICA vía por la que un admin se entera de que alguien ganó el pozo: no
 * hay mail ni push. Cae a ceros si falla, para no romper el layout entero.
 */
export async function getJackpotPendingCount(): Promise<JackpotPendingCount> {
  try {
    const res = await apiFetch("/jackpot-claims/pending-count")
    if (!res.ok) return EMPTY_COUNT
    const json = (await res.json()) as Partial<JackpotPendingCount> | null
    if (!json || typeof json.total !== "number") return EMPTY_COUNT
    return {
      total: json.total,
      pendingContact: json.pendingContact ?? 0,
      inReview: json.inReview ?? 0,
      amountOwed: Number(json.amountOwed) || 0,
    }
  } catch {
    return EMPTY_COUNT
  }
}

type RawMajorClaim = {
  id: string
  claimCode: string
  prize?: {
    name?: string
    value?: number | string | null
    imageUrl?: string | null
  } | null
  user?: { name?: string | null; phone?: string | null } | null
  // El backend devuelve `bar: null` si el claim quedó sin bar.
  bar?: { id: string; name: string } | null
  createdAt: string
  expiresAt: string
}

export type MajorClaimsPage = { data: MajorClaim[]; total: number }

/**
 * Premios mayores (GET /prize-claims/major). Sin `barId` trae los de todos.
 *
 * Listar los pendientes tiene un efecto de lado en el backend: marca como
 * vencidos los que pasaron su `expiresAt`. Por eso la lista es la fuente de
 * verdad del estado, no un caché del cliente.
 */
export async function getMajorClaims(params: {
  status: ClaimStatus
  barId?: string
  limit: number
  offset: number
}): Promise<MajorClaimsPage> {
  const qs = new URLSearchParams({
    status: params.status,
    limit: String(params.limit),
    offset: String(params.offset),
  })
  if (params.barId) qs.set("barId", params.barId)

  try {
    const res = await apiFetch(`/prize-claims/major?${qs.toString()}`)
    if (!res.ok) return { data: [], total: 0 }
    const json = (await res.json()) as {
      data?: RawMajorClaim[]
      total?: number
    } | null
    if (!json || !Array.isArray(json.data)) return { data: [], total: 0 }
    return {
      data: json.data.map(toMajorClaim),
      total: json.total ?? json.data.length,
    }
  } catch {
    return { data: [], total: 0 }
  }
}

function toMajorClaim(r: RawMajorClaim): MajorClaim {
  // `value` e `imageUrl` vienen null en la práctica: el monto está en el nombre.
  const value = r.prize?.value
  return {
    id: r.id,
    claimCode: r.claimCode,
    prizeName: r.prize?.name || "Premio sin nombre",
    prizeValue: value === null || value === undefined ? null : Number(value) || null,
    prizeImageUrl: r.prize?.imageUrl ?? null,
    playerName: r.user?.name ?? null,
    playerPhone: r.user?.phone ?? null,
    barId: r.bar?.id ?? null,
    barName: r.bar?.name ?? null,
    createdAt: r.createdAt,
    expiresAt: r.expiresAt,
  }
}

type RawMovement = {
  id: string
  type: "contribution" | "jackpot_win" | "adjustment"
  amount: number | string
  balanceBefore: number | string
  balanceAfter: number | string
  barId: string | null
  playId: string | null
  notes: string | null
  createdAt: string
}

/**
 * Traduce el tipo del backend al del panel. Un `contribution` puede ser una
 * jugada por el pozo (tiene playId → aporte por tirada) o una recarga de bar
 * (sin playId → parte de la recarga que va al pozo).
 */
function toMovementType(m: RawMovement): MovementType {
  if (m.type === "jackpot_win") return "payout"
  if (m.type === "adjustment") return "adjust"
  return m.playId ? "game_spin" : "topup"
}

function toMovement(m: RawMovement): PoolMovement {
  const before = Number(m.balanceBefore) || 0
  const after = Number(m.balanceAfter) || 0
  return {
    id: m.id,
    at: m.createdAt,
    type: toMovementType(m),
    // El signo real sale de balanceAfter − balanceBefore.
    poolDelta: after - before,
    total: Number(m.amount) || 0,
    notes: m.notes,
  }
}

export type MovementCategory = "all" | MovementType

export type MovementsPage = { data: PoolMovement[]; total: number }

/**
 * Página del historial del pozo (GET /pool-movements paginado).
 * `category` filtra por las 4 categorías del panel; `search` busca en notas.
 */
export async function getMovementsPage(params: {
  limit: number
  offset: number
  category?: MovementCategory
  search?: string
}): Promise<MovementsPage> {
  const qs = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  })
  if (params.category && params.category !== "all") qs.set("category", params.category)
  if (params.search) qs.set("search", params.search)

  try {
    const res = await apiFetch(`/pool-movements?${qs.toString()}`)
    if (!res.ok) return { data: [], total: 0 }
    const json = (await res.json()) as { data?: RawMovement[]; total?: number } | null
    if (!json || !Array.isArray(json.data)) return { data: [], total: 0 }
    return { data: json.data.map(toMovement), total: json.total ?? json.data.length }
  } catch {
    return { data: [], total: 0 }
  }
}

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
  /** Premio incluido por el backend (join). */
  prize?: { id: string; name: string; type: "local" | "jackpot" } | null
}

/** Símbolos del pozo global: símbolos activos con barId = null (GET /symbols). */
export async function getGlobalSymbols(): Promise<GlobalSymbol[]> {
  const res = await apiFetch("/symbols")
  if (!res.ok) return []
  const raw = (await res.json()) as RawSymbol[]
  return raw
    .filter((s) => s.barId === null && s.isActive)
    .map((s) => {
      const img = isImageSrc(s.imageUrl)
      return {
        id: s.id,
        name: s.name,
        emoji: img ? "🎰" : s.imageUrl,
        imageUrl: img ? s.imageUrl : null,
        weight: s.weight,
        minMatch: toMatchLevel(s.minMatchToWin),
        isJackpot: s.isJackpot === true,
        // "Con premio" = el prizeId resuelve a un premio existente (cualquiera
        // del pozo). El join `prize` es null si el premio fue borrado (prizeId
        // colgado); así coincide con lo que muestra el módulo Premios.
        hasPrize: s.prize != null,
        prizeId: s.prize ? s.prizeId : null,
        prizeName: s.prize?.name ?? null,
      }
    })
}

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

/** Premios del pozo global: premios con barId = null (GET /prizes?isGlobal=true). */
export async function getGlobalPrizes(): Promise<Prize[]> {
  const res = await apiFetch("/prizes?isGlobal=true")
  if (!res.ok) return []
  const raw = (await res.json()) as RawPrize[]
  return raw.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    value: p.value === null ? null : Number(p.value),
    stock: p.stock ?? null,
    status: (p.isActive ? "active" : "inactive") as PrizeStatus,
    desc: p.description ?? "",
    imageUrl: p.imageUrl ?? null,
  }))
}
