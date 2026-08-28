/**
 * Check de los pozos ganados:
 * `node --experimental-strip-types lib/pozo/jackpots.check.ts`
 *
 * Importa porque marcar pagado es irreversible y mueve contabilidad.
 */
import assert from "node:assert/strict"

import {
  byUrgency,
  canPay,
  matchesFolio,
  statusForView,
  STATUS_META,
} from "./jackpots.ts"
import type { JackpotClaim, JackpotClaimStatus } from "./types.ts"

const claim = (
  over: Partial<JackpotClaim> & { status: JackpotClaimStatus }
): JackpotClaim => ({
  id: "c1",
  folio: "J-QNXRUM",
  amount: 100000,
  playedAt: "2026-08-25T23:27:18.709Z",
  contactedAt: null,
  paidAt: null,
  barName: "Kilkenny Irish Pub",
  playerName: "QA Pozo",
  playerPhone: "+595986111222",
  ...over,
})

// --- statusForView: "pending" no es un estado del backend ---
assert.equal(statusForView("pending"), undefined)
assert.equal(statusForView("in_review"), "in_review")
assert.equal(statusForView("pending_contact"), "pending_contact")
assert.equal(statusForView("paid"), "paid")

// --- canPay: lo pagado no se vuelve a pagar ---
assert.equal(canPay(claim({ status: "pending_contact" })), true)
assert.equal(canPay(claim({ status: "in_review" })), true)
assert.equal(canPay(claim({ status: "paid", paidAt: "2026-08-26T00:00:00Z" })), false)

// --- sólo in_review reclama acción del admin ---
assert.equal(STATUS_META.in_review.needsAction, true)
assert.equal(STATUS_META.pending_contact.needsAction, false)
assert.equal(STATUS_META.paid.needsAction, false)
// Y los dos pendientes se ven distinto, que es el requisito.
assert.notEqual(
  STATUS_META.in_review.className,
  STATUS_META.pending_contact.className
)

// --- orden de trabajo ---
const viejo = (s: JackpotClaimStatus, playedAt: string, folio: string) =>
  claim({ status: s, playedAt, folio })

const lista = [
  viejo("paid", "2026-08-01T00:00:00Z", "J-PAID"),
  viejo("pending_contact", "2026-08-02T00:00:00Z", "J-SINCONT"),
  viejo("in_review", "2026-08-20T00:00:00Z", "J-NUEVO"),
  viejo("in_review", "2026-08-10T00:00:00Z", "J-ESPERA"),
]
assert.deepEqual(
  [...lista].sort(byUrgency).map((c) => c.folio),
  // in_review primero (el más viejo antes), después sin contactar, último pagado.
  ["J-ESPERA", "J-NUEVO", "J-SINCONT", "J-PAID"]
)

// --- búsqueda por folio (el caso real: llega por WhatsApp) ---
const c = claim({ status: "in_review" })
assert.equal(matchesFolio(c, ""), true)
assert.equal(matchesFolio(c, "J-QNXRUM"), true)
assert.equal(matchesFolio(c, "j-qnxrum"), true) // sin importar mayúsculas
assert.equal(matchesFolio(c, "  J-QNXRUM  "), true) // pegado con espacios
assert.equal(matchesFolio(c, "qnx"), true) // parcial
assert.equal(matchesFolio(c, "QA Pozo"), true) // por nombre
assert.equal(matchesFolio(c, "986111"), true) // por teléfono
assert.equal(matchesFolio(c, "J-OTRO"), false)

// Un claim sin jugador (el backend puede omitir `user`) no rompe la búsqueda.
const huerfano = claim({ status: "in_review", playerName: null, playerPhone: null })
assert.equal(matchesFolio(huerfano, "QA Pozo"), false)
assert.equal(matchesFolio(huerfano, "J-QNXRUM"), true)

console.log("ok")
