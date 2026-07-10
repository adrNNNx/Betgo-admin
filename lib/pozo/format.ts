// Formateadores compartidos del módulo Pozo global (locale es-PY, moneda PYG).

/** "Gs. 1.918.000" — siempre valor absoluto (el signo se maneja aparte). */
export function formatGs(value: number): string {
  return "Gs. " + Math.abs(Math.round(value)).toLocaleString("es-PY")
}

/** "1.918.000" — número sin prefijo, valor absoluto. */
export function formatNumber(value: number): string {
  return Math.abs(Math.round(value)).toLocaleString("es-PY")
}

/** Versión compacta para lugares angostos: "Gs. 1.9M", "Gs. 30k". */
export function formatCompact(value: number): string {
  const n = Math.abs(value)
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return "Gs. " + (v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)) + "M"
  }
  if (n >= 1_000) return "Gs. " + Math.floor(n / 1_000) + "k"
  return "Gs. " + n.toLocaleString("es-PY")
}

/** "33%", "5.4%". */
export function formatPct(p: number): string {
  return (p >= 10 ? p.toFixed(0) : p.toFixed(1)) + "%"
}

const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
]

/** Divide un ISO en fecha corta ("29 ene 2026") y hora ("20:13"). */
export function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  const date = `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`
  return { date, time }
}

/** "29 ene 2026 · 20:13". */
export function formatStamp(iso: string): string {
  const { date, time } = formatDateTime(iso)
  return `${date} · ${time}`
}
