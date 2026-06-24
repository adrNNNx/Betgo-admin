import { Store, Wallet, Building2, Trophy } from "lucide-react"

import type { Bar } from "@/lib/bares/types"
import type { PlatformKpis } from "@/lib/bares/api"
import { formatGs } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function BaresKpis({ bars, kpis }: { bars: Bar[]; kpis: PlatformKpis }) {
  const active = bars.filter((b) => b.status === "active").length
  const totalBalance = bars.reduce((sum, b) => sum + b.balance, 0)

  const items = [
    { label: "Bares activos", icon: Store, value: String(active), sub: `de ${bars.length} registrado${bars.length === 1 ? "" : "s"}` },
    { label: "Saldo en plataforma", icon: Wallet, value: formatGs(totalBalance), sub: "disponible para venta" },
    { label: "Ganancia empresa", icon: Building2, value: formatGs(kpis.totalPlatformEarnings), sub: "acumulado por recargas" },
    { label: "Aporte al pozo", icon: Trophy, value: formatGs(kpis.totalPoolCollected), sub: "recaudado para el pozo" },
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
