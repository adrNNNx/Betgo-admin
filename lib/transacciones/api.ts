import "server-only"

import { apiFetch } from "@/lib/session"
import { categoryOf } from "@/lib/transacciones/utils"
import type {
  BarOption,
  Transaction,
  TransactionFilters,
  TransactionSummary,
} from "@/lib/transacciones/types"

type RawTx = {
  id: string
  type: Transaction["type"]
  amount: number | string
  barId: string | null
  userId: string | null
  paymentMethod: string | null
  balanceBefore: number | string | null
  balanceAfter: number | string | null
  reference: string | null
  notes: string | null
  createdAt: string
  bar?: { id: string; name: string } | null
  user?: { id: string; name: string | null } | null
  staff?: { user?: { name: string | null } | null } | null
}

function toTransaction(r: RawTx): Transaction {
  return {
    id: r.id,
    ref: r.reference || r.id.slice(0, 8).toUpperCase(),
    timestamp: r.createdAt,
    type: r.type,
    category: categoryOf(r.type),
    amount: Number(r.amount) || 0,
    barId: r.barId,
    barName: r.bar?.name ?? null,
    mozoName: r.staff?.user?.name ?? null,
    playerId: r.userId,
    playerName: r.user?.name ?? null,
    method: r.paymentMethod,
    balanceBefore: r.balanceBefore === null ? null : Number(r.balanceBefore),
    balanceAfter: r.balanceAfter === null ? null : Number(r.balanceAfter),
    note: r.notes,
  }
}

// Nuestra categoría de UI → el valor que espera el backend.
const CATEGORY_PARAM: Record<string, string> = {
  play: "play",
  recharge: "recharge",
  prize: "prize",
  revenue: "platform",
  adjust: "adjustment",
}

// Query compartida para lista y resumen.
function filtersToParams(f: TransactionFilters): URLSearchParams {
  const qs = new URLSearchParams()
  if (f.category !== "all") qs.set("category", CATEGORY_PARAM[f.category] ?? f.category)
  if (f.barId !== "all") qs.set("barId", f.barId)
  if (f.from) qs.set("from", f.from)
  if (f.to) qs.set("to", f.to)
  if (f.query.trim()) qs.set("search", f.query.trim())
  return qs
}

export type TransactionsPage = { data: Transaction[]; total: number }

/**
 * Página de transacciones (GET /transactions paginado + filtros).
 *
 * TODO(backend): el service/controller de `transactions` es un scaffold vacío.
 * Falta implementar `GET /transactions?category=&barId=&from=&to=&search=&limit=&offset=`
 * devolviendo `{ data, total }` con includes de bar, user (jugador) y staff→user
 * (mozo). Hasta entonces esto degrada a lista vacía.
 */
export async function getTransactionsPage(
  filters: TransactionFilters,
  limit: number,
  offset: number
): Promise<TransactionsPage> {
  const qs = filtersToParams(filters)
  qs.set("limit", String(limit))
  qs.set("offset", String(offset))
  try {
    const res = await apiFetch(`/transactions?${qs.toString()}`)
    if (!res.ok) return { data: [], total: 0 }
    const json = (await res.json()) as { data?: RawTx[]; total?: number } | null
    if (!json || !Array.isArray(json.data)) return { data: [], total: 0 }
    return { data: json.data.map(toTransaction), total: json.total ?? json.data.length }
  } catch {
    return { data: [], total: 0 }
  }
}

const EMPTY_SUMMARY: TransactionSummary = { count: 0, total: 0, average: 0, byType: {} }

/**
 * Agregados del conjunto filtrado (GET /transactions/summary).
 *
 * TODO(backend): falta `GET /transactions/summary?<mismos filtros>` devolviendo
 * `{ count, total, byType: { <type>: { count, total } } }` (sumas por tipo).
 */
export async function getTransactionsSummary(
  filters: TransactionFilters
): Promise<TransactionSummary> {
  try {
    const res = await apiFetch(`/transactions/summary?${filtersToParams(filters).toString()}`)
    if (!res.ok) return EMPTY_SUMMARY
    const json = (await res.json()) as Partial<TransactionSummary> | null
    if (!json || typeof json.count !== "number") return EMPTY_SUMMARY
    return {
      count: json.count,
      total: json.total ?? 0,
      average: json.average ?? (json.count ? Math.round((json.total ?? 0) / json.count) : 0),
      byType: json.byType ?? {},
    }
  } catch {
    return EMPTY_SUMMARY
  }
}

/**
 * Últimas transacciones de un jugador (para el detalle).
 *
 * TODO(backend): `GET /transactions?userId=&limit=` (mismo endpoint, filtrando
 * por jugador). Degrada a lista vacía hasta implementarlo.
 */
export async function getPlayerHistory(
  playerId: string,
  limit: number
): Promise<Transaction[]> {
  try {
    const res = await apiFetch(
      `/transactions?userId=${encodeURIComponent(playerId)}&limit=${limit}`
    )
    if (!res.ok) return []
    const json = (await res.json()) as { data?: RawTx[] } | RawTx[] | null
    const rows = Array.isArray(json) ? json : (json?.data ?? [])
    return rows.map(toTransaction)
  } catch {
    return []
  }
}

/** Bares para el filtro (reusa el endpoint real de bares). */
export async function getBarOptions(): Promise<BarOption[]> {
  const res = await apiFetch("/bars?includeInactive=true")
  if (!res.ok) return []
  const bars = (await res.json()) as { id: string; name: string }[]
  return bars.map((b) => ({ id: b.id, name: b.name }))
}
