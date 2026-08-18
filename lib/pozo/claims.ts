import type { ClaimStatus, MajorClaim } from "@/lib/pozo/types"

/** Días que dura un comprobante desde que se gana (lo fija el backend). */
export const CLAIM_DAYS = 7

/** A partir de acá el vencimiento se marca en rojo. */
export const URGENT_DAYS = 2

export const CLAIM_PAGE_SIZE = 50

export const STATUS_FILTERS: { value: ClaimStatus; label: string }[] = [
  { value: "pending", label: "Pendientes" },
  { value: "delivered", label: "Entregados" },
  { value: "expired", label: "Vencidos" },
]

export type Urgency = "vencido" | "urgente" | "pronto" | "normal"

/**
 * Días completos que faltan para el vencimiento. Negativo si ya venció.
 * Se calcula sobre el día calendario, no sobre las horas exactas: al admin le
 * importa "le quedan 2 días", no "le quedan 41 horas".
 */
export function daysLeft(expiresAt: string, now = new Date()): number {
  const end = new Date(expiresAt)
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  return Math.round((startOfDay(end) - startOfDay(now)) / 86_400_000)
}

export function urgencyOf(expiresAt: string, now = new Date()): Urgency {
  const d = daysLeft(expiresAt, now)
  if (d < 0) return "vencido"
  if (d === 0) return "urgente"
  if (d <= URGENT_DAYS) return "pronto"
  return "normal"
}

/** Texto del vencimiento en días, que es como lo piensa el admin. */
export function expiryLabel(expiresAt: string, now = new Date()): string {
  const d = daysLeft(expiresAt, now)
  if (d < 0) return d === -1 ? "venció ayer" : `venció hace ${-d} días`
  if (d === 0) return "vence hoy"
  if (d === 1) return "queda 1 día"
  return `quedan ${d} días`
}

/**
 * Un comprobante sólo se puede entregar si está pendiente y no venció.
 * Un vencido no se recupera por API: hay que tocar la base a mano.
 */
export function canDeliver(claim: MajorClaim, status: ClaimStatus): boolean {
  return status === "pending" && daysLeft(claim.expiresAt) >= 0
}

/** Busca por código, jugador o premio dentro de la página cargada. */
export function matchesQuery(claim: MajorClaim, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    claim.claimCode.toLowerCase().includes(q) ||
    (claim.playerName?.toLowerCase().includes(q) ?? false) ||
    (claim.playerPhone?.includes(q) ?? false) ||
    claim.prizeName.toLowerCase().includes(q)
  )
}
