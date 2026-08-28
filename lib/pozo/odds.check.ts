/**
 * Check de la frecuencia por símbolo: `node --experimental-strip-types lib/pozo/odds.check.ts`
 * Los valores esperados salen de la simulación de 2M giros contra el motor real.
 */
import assert from "node:assert/strict"

import {
  probAtLeast,
  spinsPerWin,
  oddsLevel,
  formatOdds,
  combinedSpinsPerWin,
  jackpotOddsLevel,
} from "./odds.ts"

// Bordes.
assert.equal(probAtLeast(0, 3), 0)
assert.equal(probAtLeast(1, 5), 1)
// Con p=1 sale en los 5 siempre, así que "al menos 3" también es seguro.
assert.equal(probAtLeast(1, 3), 1)

// Monotonía: exigir más iguales nunca puede ser más probable.
for (const p of [0.05, 0.1, 0.3, 0.5]) {
  assert.ok(probAtLeast(p, 3) > probAtLeast(p, 4))
  assert.ok(probAtLeast(p, 4) > probAtLeast(p, 5))
}
// Y más peso nunca puede pagar menos seguido.
for (const k of [3, 4, 5]) {
  assert.ok(probAtLeast(0.3, k) > probAtLeast(0.1, k))
}

// 10 símbolos parejos (p=0.1) — coincide con la tabla del backend:
// los 10 juntos dan 1/12, 1/217 y 1/10.000.
assert.equal(spinsPerWin(10, 100, 3), 117)
assert.equal(spinsPerWin(10, 100, 4), 2174)
assert.equal(spinsPerWin(10, 100, 5), 100000)

// Config real del pozo (pesos 32/20/20/15/10/10, total 107). Estos números
// se validaron con 2.000.000 de giros contra el RNG del backend.
const TOTAL = 107
assert.equal(spinsPerWin(32, TOTAL, 3), 6) // Trébol: observado 1/6
assert.equal(spinsPerWin(20, TOTAL, 4), 193) // Diamante: observado 1/193
assert.equal(spinsPerWin(20, TOTAL, 5), 4383) // Corona: observado 1/4454

// El peso mínimo es 1 (el backend valida @Min(1) y la UI no deja bajar de ahí),
// así que spinsPerWin siempre da un número: nunca hay "probabilidad cero".
// Un 0 que se filtre igual se trata como 1 en vez de romper el render.
assert.equal(spinsPerWin(1, TOTAL, 3), spinsPerWin(0, TOTAL, 3))
assert.ok(Number.isFinite(spinsPerWin(1, TOTAL, 5)))

// El aviso escala con la frecuencia.
assert.equal(oddsLevel(6), "extremo")
assert.equal(oddsLevel(45), "alto")
assert.equal(oddsLevel(4383), "normal")
assert.equal(oddsLevel(100000), "raro")

assert.equal(formatOdds(4383), "1 cada 4.383 jugadas")

// --- Agregado: la config real del pozo entera ---
// La simulación de 2M giros dio "premios menores: 1 cada 6 jugadas".
const CONFIG = [
  { weight: 32, minMatch: 3 as const, pays: true }, // Trébol
  { weight: 20, minMatch: 5 as const, pays: true }, // Corona
  { weight: 20, minMatch: 4 as const, pays: true }, // Diamante
  { weight: 15, minMatch: 5 as const, pays: true }, // Campana
  { weight: 10, minMatch: 5 as const, pays: true }, // Cerveza
  { weight: 10, minMatch: 5 as const, pays: true }, // Cereza
]
assert.equal(combinedSpinsPerWin(CONFIG), 6)

// Un símbolo sin premio no aporta al total.
const sinPremio = CONFIG.map((s) => ({ ...s, pays: false }))
assert.equal(combinedSpinsPerWin(sinPremio), null)

// Subir el Trébol de 3 a 5 hace el conjunto >10x más raro (6 → 127). No cae
// más porque el Diamante en 4 pasa a mandar: el total lo fija el símbolo más
// generoso, no el promedio. Es justo lo que la pantalla tiene que dejar ver.
const conservador = CONFIG.map((s, i) =>
  i === 0 ? { ...s, minMatch: 5 as const } : s
)
const antes = combinedSpinsPerWin(CONFIG)!
const despues = combinedSpinsPerWin(conservador)!
assert.ok(despues > antes * 10, `esperaba >${antes * 10}, dio ${despues}`)
assert.equal(despues, 127)

// --- El pozo se mide con otra vara ---
// Con peso 32/107 el pozo se vaciaría 1 cada 418 jugadas: no llega a crecer.
assert.equal(spinsPerWin(32, TOTAL, 5), 418)
assert.equal(jackpotOddsLevel(418), "extremo")
// Con peso 10/107 (la Cereza) es 1 cada 140.255: sano.
assert.equal(spinsPerWin(10, TOTAL, 5), 140255)
assert.equal(jackpotOddsLevel(140255), "normal")
// La zona intermedia avisa sin alarmar.
assert.equal(jackpotOddsLevel(4383), "alto")
// Un umbral que para premios menores es "normal" para el pozo ya es grave.
assert.equal(oddsLevel(418), "normal")
assert.equal(jackpotOddsLevel(418), "extremo")

// --- Máquina de un bar: los globales entran en el denominador ---
// El motor tira `barId IS NULL OR barId = :bar`, así que la máquina de Kilkenny
// son sus 2 símbolos (43 + 10) MÁS los globales (peso 100). Calcularlo sólo
// sobre los propios infla el número una barbaridad.
const PROPIO = 53
const MAQUINA = PROPIO + 100

// Killkeny-logo, peso 43, pagando desde 3:
assert.equal(spinsPerWin(43, PROPIO, 3), 1) // mal: "casi todas las jugadas"
assert.equal(spinsPerWin(43, MAQUINA, 3), 7) // bien
// iphone, peso 10:
assert.equal(spinsPerWin(10, PROPIO, 3), 20) // mal
assert.equal(spinsPerWin(10, MAQUINA, 3), 396) // bien

// Y el formato del borde: con probabilidad ~1 no decimos "1 cada 1 jugadas".
assert.equal(formatOdds(1), "casi todas las jugadas")

console.log("ok")
