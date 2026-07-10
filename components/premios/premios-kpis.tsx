import { AlertTriangle, Gift, Link2Off, Store } from "lucide-react"

import type { Summary } from "@/lib/premios/helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function PremiosKpis({ summary }: { summary: Summary }) {
  const items = [
    {
      label: "Premios registrados",
      icon: Gift,
      value: String(summary.total),
      sub: `${summary.active} activos · ${summary.inactive} inactivos`,
    },
    {
      label: "Bares",
      icon: Store,
      value: String(summary.scopes),
      sub: summary.scopes === 1 ? "bar registrado" : "bares registrados",
    },
    {
      label: "Símbolos sin premio",
      icon: Link2Off,
      value: String(summary.unassigned),
      sub: summary.unassigned ? "requieren asignación" : "todo asignado",
      warn: summary.unassigned > 0,
    },
    {
      label: "Stock crítico",
      icon: AlertTriangle,
      value: String(summary.critical),
      sub: "premios con stock bajo o agotado",
      bad: summary.critical > 0,
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
            <div
              className={cn(
                "text-2xl font-bold tracking-tight tabular-nums",
                item.warn && "text-amber-600 dark:text-amber-500",
                item.bad && "text-red-600 dark:text-red-400"
              )}
            >
              {item.value}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{item.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
