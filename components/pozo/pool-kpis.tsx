import { List, Scale, TrendingDown, TrendingUp } from "lucide-react"

import type { PoolState } from "@/lib/pozo/types"
import { formatNumber } from "@/lib/pozo/format"
import { Card } from "@/components/ui/card"

/** Fila de KPIs derivados del estado del pozo. */
export function PoolKpis({
  pool,
  movementsTotal,
}: {
  pool: PoolState
  movementsTotal: number
}) {
  const net = pool.contributions - pool.payouts

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Kpi
        label="Contribuciones acumuladas"
        icon={<TrendingUp className="size-4" />}
        value={pool.contributions}
        sub="de jugadas y recargas"
      />
      <Kpi
        label="Pagos realizados"
        icon={<TrendingDown className="size-4" />}
        value={pool.payouts}
        sub="a ganadores del pozo"
      />
      <Kpi
        label="Aporte neto"
        icon={<Scale className="size-4" />}
        value={net}
        sub="contribuciones − pagos"
        tone={net >= 0 ? "pos" : "neg"}
      />
      <Kpi
        label="Movimientos registrados"
        icon={<List className="size-4" />}
        value={movementsTotal}
        sub="en el historial"
        currency={false}
      />
    </div>
  )
}

function Kpi({
  label,
  icon,
  value,
  sub,
  tone,
  currency = true,
}: {
  label: string
  icon: React.ReactNode
  value: number
  sub: string
  tone?: "pos" | "neg"
  currency?: boolean
}) {
  const toneClass =
    tone === "pos"
      ? "text-emerald-600 dark:text-emerald-500"
      : tone === "neg"
        ? "text-red-600 dark:text-red-500"
        : ""

  return (
    <Card className="gap-0 p-4">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-[12.5px] font-medium">{label}</span>
        {icon}
      </div>
      <div className={`mt-2 text-[22px] font-bold tracking-tight tabular-nums ${toneClass}`}>
        {currency && (
          <span className="mr-1 text-[13px] font-semibold text-muted-foreground">
            Gs.
          </span>
        )}
        {formatNumber(value)}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
    </Card>
  )
}
