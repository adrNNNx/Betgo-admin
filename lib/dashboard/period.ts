// Período del dashboard. Solo afecta las métricas de "flujo" (ganancia,
// premios, ranking); el estado actual (pozo, bares, saldo, personal) es siempre
// el vigente. Manejado por URL (?period=) para que el server component
// re-renderice sin fetch en el cliente.

export type Period = "today" | "7d" | "30d" | "all"

export const PERIODS: { value: Period; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "all", label: "Todo" },
]

export const DEFAULT_PERIOD: Period = "30d"

export function parsePeriod(v: string | undefined): Period {
  return PERIODS.some((p) => p.value === v) ? (v as Period) : DEFAULT_PERIOD
}

/** ISO from/to para el período. `all` = sin rango (histórico completo). */
export function periodRange(period: Period): { from?: string; to?: string } {
  if (period === "all") return {}
  const to = new Date()
  const from = new Date()
  if (period === "today") from.setHours(0, 0, 0, 0)
  else from.setDate(from.getDate() - (period === "7d" ? 7 : 30))
  return { from: from.toISOString(), to: to.toISOString() }
}
