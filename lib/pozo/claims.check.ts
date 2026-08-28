/**
 * Check del vencimiento de comprobantes:
 * `node --experimental-strip-types lib/pozo/claims.check.ts`
 *
 * Importa porque un vencido no se puede entregar y no se recupera por API.
 */
import assert from "node:assert/strict"

import {
  canDeliver,
  daysLeft,
  expiryLabel,
  matchesQuery,
  urgencyOf,
} from "./claims.ts"
import type { MajorClaim } from "./types.ts"

// Mediodía, para que sumar/restar horas no cruce de día por accidente.
const AHORA = new Date("2026-08-03T12:00:00")
const enDias = (d: number, hora = "12:00:00") => {
  const f = new Date(AHORA)
  f.setDate(f.getDate() + d)
  return `${f.toISOString().slice(0, 10)}T${hora}`
}

// --- daysLeft cuenta días de calendario, no horas ---
assert.equal(daysLeft(enDias(0), AHORA), 0)
assert.equal(daysLeft(enDias(7), AHORA), 7)
assert.equal(daysLeft(enDias(-1), AHORA), -1)
// Vence hoy a las 23:59 → sigue siendo "hoy", no "mañana".
assert.equal(daysLeft(enDias(0, "23:59:00"), AHORA), 0)
// Vence mañana a las 00:01 → es 1 día, aunque falten pocas horas.
assert.equal(daysLeft(enDias(1, "00:01:00"), AHORA), 1)

// --- urgencia ---
assert.equal(urgencyOf(enDias(-1), AHORA), "vencido")
assert.equal(urgencyOf(enDias(0), AHORA), "urgente")
assert.equal(urgencyOf(enDias(1), AHORA), "pronto")
assert.equal(urgencyOf(enDias(2), AHORA), "pronto")
assert.equal(urgencyOf(enDias(3), AHORA), "normal")

// --- textos ---
assert.equal(expiryLabel(enDias(0), AHORA), "vence hoy")
assert.equal(expiryLabel(enDias(1), AHORA), "queda 1 día")
assert.equal(expiryLabel(enDias(5), AHORA), "quedan 5 días")
assert.equal(expiryLabel(enDias(-1), AHORA), "venció ayer")
assert.equal(expiryLabel(enDias(-3), AHORA), "venció hace 3 días")

// --- quién se puede entregar ---
const claim = (expiresAt: string): MajorClaim => ({
  id: "c1",
  claimCode: "P-TEST0001",
  prizeName: "IPHONE 17 PRO MAX",
  prizeValue: null,
  prizeImageUrl: null,
  playerName: "Ricardo Benítez",
  playerPhone: "+595973123456",
  barId: "b1",
  barName: "Kilkenny Irish Pub",
  createdAt: "2026-08-01T12:00:00.000Z",
  expiresAt,
})

// Vencido: nunca, aunque el backend todavía lo liste como pendiente.
assert.equal(canDeliver(claim(enDias(-1)), "pending", AHORA), false)
// Ya entregado o marcado vencido: tampoco.
assert.equal(canDeliver(claim(enDias(5)), "delivered", AHORA), false)
assert.equal(canDeliver(claim(enDias(5)), "expired", AHORA), false)
// El único caso que sí.
assert.equal(canDeliver(claim(enDias(5)), "pending", AHORA), true)
// El que vence hoy todavía se entrega.
assert.equal(canDeliver(claim(enDias(0)), "pending", AHORA), true)

// --- búsqueda ---
const c = claim(enDias(5))
assert.equal(matchesQuery(c, ""), true)
assert.equal(matchesQuery(c, "p-test"), true) // código, sin importar mayúsculas
assert.equal(matchesQuery(c, "  P-TEST0001  "), true) // con espacios de más
assert.equal(matchesQuery(c, "ricardo"), true) // jugador
assert.equal(matchesQuery(c, "973123"), true) // teléfono parcial
assert.equal(matchesQuery(c, "iphone"), true) // premio
assert.equal(matchesQuery(c, "nada"), false)

// Un claim sin jugador ni bar no rompe la búsqueda.
const huerfano: MajorClaim = {
  ...c,
  playerName: null,
  playerPhone: null,
  barName: null,
  barId: null,
}
assert.equal(matchesQuery(huerfano, "ricardo"), false)
assert.equal(matchesQuery(huerfano, "iphone"), true)

console.log("ok")
