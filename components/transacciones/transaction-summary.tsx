import { ArrowLeftRight, Building2, Trophy, Wallet } from "lucide-react"

import type { TransactionSummary } from "@/lib/transacciones/types"
import { formatGs } from "@/lib/transacciones/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/** Suma el total de un conjunto de tipos crudos del `byType`. */
function sumTypes(summary: TransactionSummary, types: string[]): number {
  return types.reduce((acc, t) => acc + (summary.byType[t]?.total ?? 0), 0)
}

export function TransactionSummaryCards({
  summary,
}: {
  summary: TransactionSummary
}) {
  const poolPlays = sumTypes(summary, ["play_pool"])
  const company = sumTypes(summary, ["platform_revenue"])
  const prizes = sumTypes(summary, ["prize_jackpot", "prize_local"])

  const items = [
    {
      label: "Transacciones",
      icon: ArrowLeftRight,
      value: String(summary.count),
      sub: `promedio ${formatGs(summary.average)}`,
    },
    {
      label: "Aporte al pozo",
      icon: Wallet,
      value: formatGs(poolPlays),
      sub: "jugadas por el pozo",
    },
    {
      label: "Ganancia empresa",
      icon: Building2,
      value: formatGs(company),
      sub: "ingresos de plataforma",
    },
    {
      label: "Premios pagados",
      icon: Trophy,
      value: formatGs(prizes),
      sub: "locales + jackpot",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader>
            <div className="flex items-center justify-between text-muted-foreground">
              <CardTitle className="text-sm font-medium text-foreground">
                {item.label}
              </CardTitle>
              <item.icon className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight tabular-nums">
              {item.value}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{item.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
