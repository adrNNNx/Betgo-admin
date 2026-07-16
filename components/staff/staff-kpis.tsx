import { UserCheck, HandPlatter, ShieldCheck, UserX } from "lucide-react"

import type { StaffSummary } from "@/lib/staff/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/** KPIs del personal. Los totales vienen agregados del backend (tabla paginada). */
export function StaffKpis({ summary }: { summary: StaffSummary }) {
  const noAccess = summary.inactive + summary.suspended

  const items = [
    {
      label: "Personal habilitado",
      icon: UserCheck,
      value: String(summary.active),
      sub: `de ${summary.total} registrado${summary.total === 1 ? "" : "s"}`,
    },
    {
      label: "Mozos",
      icon: HandPlatter,
      value: String(summary.mozos),
      sub: "atienden y cargan créditos",
    },
    {
      label: "Encargados y admins",
      icon: ShieldCheck,
      value: String(summary.managers),
      sub: "gestionan el bar",
    },
    {
      label: "Sin acceso",
      icon: UserX,
      value: String(noAccess),
      sub: "inactivos o suspendidos",
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
