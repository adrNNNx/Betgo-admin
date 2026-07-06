import { UserCheck, HandPlatter, ShieldCheck, UserX } from "lucide-react"

import type { StaffMember } from "@/lib/staff/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StaffKpis({ staff }: { staff: StaffMember[] }) {
  const total = staff.length
  const active = staff.filter((s) => s.status === "active").length
  const mozos = staff.filter((s) => s.role === "mozo").length
  const managers = staff.filter((s) => s.role !== "mozo").length
  const noAccess = staff.filter((s) => s.status !== "active").length

  const items = [
    {
      label: "Personal habilitado",
      icon: UserCheck,
      value: String(active),
      sub: `de ${total} registrado${total === 1 ? "" : "s"}`,
    },
    {
      label: "Mozos",
      icon: HandPlatter,
      value: String(mozos),
      sub: "atienden y cargan créditos",
    },
    {
      label: "Encargados y admins",
      icon: ShieldCheck,
      value: String(managers),
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
