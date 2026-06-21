import { Store, Wallet, Gift, Trophy } from "lucide-react"

import type { Bar } from "@/lib/bares/types"
import { formatGs } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function BaresKpis({ bars }: { bars: Bar[] }) {
  const active = bars.filter((b) => b.status === "active").length
  const totalBalance = bars.reduce((sum, b) => sum + b.balance, 0)
  const avgFreePlays =
    bars.length === 0
      ? 0
      : Math.round(bars.reduce((s, b) => s + b.freePlaysPerDay, 0) / bars.length)
  const avgPozo =
    bars.length === 0
      ? 0
      : Math.round(bars.reduce((s, b) => s + b.distribution.pozo, 0) / bars.length)

  const items = [
    { label: "Bares activos", icon: Store, value: String(active), sub: `de ${bars.length} registrado${bars.length === 1 ? "" : "s"}` },
    { label: "Saldo en plataforma", icon: Wallet, value: formatGs(totalBalance), sub: "disponible para venta" },
    { label: "Jugadas gratis / día", icon: Gift, value: String(avgFreePlays), sub: "promedio por bar" },
    { label: "Aporte al pozo", icon: Trophy, value: `${avgPozo}%`, sub: "distribución promedio" },
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
