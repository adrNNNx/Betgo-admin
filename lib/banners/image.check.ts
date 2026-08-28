/**
 * Check del análisis de imagen del banner:
 * `node --experimental-strip-types lib/banners/image.check.ts`
 */
import assert from "node:assert/strict"

import { analyzeImage, cropOf, formatRatio, formatWeight } from "./image.ts"
import type { ImagePolicy } from "./image.ts"

const KB = 1024
const ideal = { width: 1400, height: 350 }

// Espeja BANNER_IMAGE de config/banners.ts. Va literal porque el runner de
// checks no resuelve el alias "@/", y acá lo que se prueba es la lógica.
const policy: ImagePolicy = {
  ratio: 4,
  ratioTolerance: 0.1,
  minWidth: 1000,
  idealKb: 200,
  maxMb: 3,
}
const analyze = (s: { width: number; height: number } | null, bytes: number) =>
  analyzeImage(s, bytes, policy)

// --- formatRatio ---
assert.equal(formatRatio(1400, 350), "4:1")
assert.equal(formatRatio(1920, 1080), "16:9")
assert.equal(formatRatio(1000, 1000), "1:1")
// Medidas que no simplifican lindo caen a decimal en vez de "1401:350".
assert.equal(formatRatio(1401, 350), "4.00:1")
assert.equal(formatRatio(0, 0), "—")

// --- cropOf: object-cover recorta, nunca deforma ---
// Una 16:9 (1.78) en una caja 4:1 se escala al ancho y sobra alto.
const c169 = cropOf({ width: 1920, height: 1080 }, 4)
assert.equal(c169.axis, "alto")
assert.equal(Math.round(c169.percent), 56) // el ejemplo de la spec
// Una 8:1 en una caja 4:1 sobra ancho: recorta los costados.
const c81 = cropOf({ width: 1600, height: 200 }, 4)
assert.equal(c81.axis, "ancho")
assert.equal(Math.round(c81.percent), 50)
// La medida ideal no pierde nada en desktop...
assert.equal(cropOf(ideal, 4).percent, 0)
// ...pero en celular (3.5:1) pierde 12,5% del ancho: 6,25% por lado.
assert.equal(Math.round(cropOf(ideal, 3.5).percent * 100) / 100, 12.5)

// --- analyzeImage ---
// La imagen ideal y liviana no genera ningún aviso.
assert.deepEqual(analyze(ideal, 150 * KB), [])

const ids = (w: ReturnType<typeof analyzeImage>) => w.map((x) => x.id).sort()

// 16:9 → avisa del recorte.
assert.deepEqual(ids(analyze({ width: 1920, height: 1080 }, 150 * KB)), ["ratio"])

// Angosta → avisa de resolución, no de relación (1200/300 es 4:1 exacto).
assert.deepEqual(ids(analyze({ width: 800, height: 200 }, 150 * KB)), [
  "resolucion",
])

// El peso ya no genera aviso: el único corte por tamaño es el error duro de
// 3MB en el formulario (ver onPick), así que una imagen pesada pero de medidas
// correctas pasa limpia.
assert.deepEqual(ids(analyze(ideal, 900 * KB)), [])

// Medidas mal → los dos avisos que quedan.
assert.deepEqual(ids(analyze({ width: 640, height: 480 }, 2.5 * 1024 * KB)), [
  "ratio",
  "resolucion",
])

// La tolerancia del 10% deja pasar lo que está cerca sin molestar.
assert.deepEqual(ids(analyze({ width: 1400, height: 330 }, 100 * KB)), []) // 4.24:1
assert.deepEqual(ids(analyze({ width: 1400, height: 380 }, 100 * KB)), []) // 3.68:1
// Y sí avisa apenas se pasa.
assert.deepEqual(ids(analyze({ width: 1400, height: 420 }, 100 * KB)), ["ratio"]) // 3.33:1

// Sin medidas (archivo corrupto) no avisa nada, pero tampoco rompe.
assert.deepEqual(analyze(null, 900 * KB), [])
assert.deepEqual(analyze(null, 100 * KB), [])

// El mensaje trae números concretos, no "la imagen no tiene el tamaño correcto".
const msg = analyze({ width: 1920, height: 1080 }, 100 * KB)[0].message
assert.match(msg, /16:9/)
assert.match(msg, /56% del alto/)

// --- formatWeight ---
assert.equal(formatWeight(150 * KB), "150KB")
assert.equal(formatWeight(2.5 * 1024 * KB), "2.5MB")

console.log("ok")
