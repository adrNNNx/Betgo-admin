import type { JackpotClaim, JackpotClaimStatus } from "@/lib/pozo/types"

export const JACKPOT_PAGE_SIZE = 25

/** Vista del filtro. `pending` junta los dos estados sin resolver. */
export type JackpotView = "pending" | JackpotClaimStatus

export const JACKPOT_VIEWS: { value: JackpotView; label: string }[] = [
  { value: "pending", label: "Pendientes" },
  { value: "pending_contact", label: "Sin contactar" },
  { value: "in_review", label: "En revisión" },
  { value: "paid", label: "Pagados" },
]

/** El status que se le manda al backend; `pending` no es uno suyo. */
export function statusForView(view: JackpotView): JackpotClaimStatus | undefined {
  return view === "pending" ? undefined : view
}

/**
 * Los dos estados pendientes no pesan igual: `in_review` significa que el
 * ganador ya escribió y está esperando la plata, así que es el que reclama
 * acción ahora. `pending_contact` todavía depende de que él aparezca.
 */
export const STATUS_META: Record<
  JackpotClaimStatus,
  { label: string; hint: string; className: string; needsAction: boolean }
> = {
  in_review: {
    label: "En revisión",
    hint: "El ganador ya escribió: falta transferir.",
    className:
      "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
    needsAction: true,
  },
  pending_contact: {
    label: "Sin contactar",
    hint: "Todavía no se comunicó por WhatsApp.",
    className:
      "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
    needsAction: false,
  },
  paid: {
    label: "Pagado",
    hint: "Transferido y cerrado.",
    className:
      "border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    needsAction: false,
  },
}

/** Sólo se paga lo que todavía no se pagó. */
export function canPay(claim: JackpotClaim): boolean {
  return claim.status !== "paid"
}

/**
 * Orden de trabajo: primero lo que espera plata (`in_review`), después lo que
 * espera al ganador, y dentro de cada grupo lo más viejo arriba — es el que
 * lleva más tiempo sin cobrar.
 */
export function byUrgency(a: JackpotClaim, b: JackpotClaim): number {
  const rank = (c: JackpotClaim) =>
    c.status === "in_review" ? 0 : c.status === "pending_contact" ? 1 : 2
  const diff = rank(a) - rank(b)
  if (diff !== 0) return diff
  return new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime()
}

/** Busca por folio, ganador o teléfono dentro de la página cargada. */
export function matchesFolio(claim: JackpotClaim, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    claim.folio.toLowerCase().includes(q) ||
    (claim.playerName?.toLowerCase().includes(q) ?? false) ||
    (claim.playerPhone?.includes(q) ?? false)
  )
}
