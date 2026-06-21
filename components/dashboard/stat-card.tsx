import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type StatCardProps = {
  label: string
  description: string
  value: string | number
  icon: LucideIcon
}

/** Tarjeta de métrica reutilizable del dashboard. */
export function StatCard({ label, description, value, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">{label}</CardTitle>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <span className="text-3xl font-bold tracking-tight tabular-nums">
          {value}
        </span>
      </CardContent>
    </Card>
  )
}
