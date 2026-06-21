import {
  Wallet,
  Trophy,
  Gift,
  Store,
  Grid2x2,
  ArrowLeftRight,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/dashboard/stat-card"

// ponytail: data fija para maquetar. Reemplazar por fetch al backend
// (server component) cuando estén los endpoints de métricas.
const stats = [
  {
    label: "Recaudación total",
    description: "Suma de recargas y compras en el último período.",
    value: "$0",
    icon: Wallet,
  },
  {
    label: "Pozo nacional",
    description: "Acumulado actual listo para el próximo ganador.",
    value: "$0",
    icon: Trophy,
  },
  {
    label: "Premios entregados",
    description: "Premios locales y nacionales validados por mozos.",
    value: 0,
    icon: Gift,
  },
  {
    label: "Bares activos",
    description: "Locales que están operando con QR en vivo.",
    value: 1,
    icon: Store,
  },
  {
    label: "Mesas registradas",
    description: "Mesas operativas con QR y juego disponible.",
    value: 1,
    icon: Grid2x2,
  },
] as const

const activity = [
  {
    title: "Mesa · Mesa 1",
    subtitle: "Asignada a Kill kenny",
    time: "12/11/25, 11:13 p. m.",
    tag: "Mesa",
    icon: Grid2x2,
  },
  {
    title: "Nuevo bar · Kill kenny",
    subtitle: "Ubicación: Asunción, Villa Morra",
    time: "12/11/25, 11:12 p. m.",
    tag: "Bar",
    icon: Store,
  },
] as const

export default function DashboardPage() {
  return (
    <>
      {/* encabezado de página */}
      <div className="flex items-start gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Panel general</h1>
          <p className="text-sm text-muted-foreground">
            Visualiza la salud de la operación y los indicadores principales del juego.
          </p>
        </div>
        <Badge variant="outline" className="ml-auto">
          MVP
        </Badge>
      </div>

      {/* métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* dos columnas */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>
              Últimos bares y mesas configurados en la plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {activity.map((item) => (
              <div key={item.title} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                  <item.icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <Badge variant="outline">{item.tag}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ranking de bares</CardTitle>
            <CardDescription>
              Top bares por recaudación y performance (orden provisional).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-5 text-sm font-semibold text-muted-foreground">1</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Kill kenny</p>
                <p className="text-xs text-muted-foreground">1 mesa</p>
              </div>
              <Badge variant="outline">Planificado</Badge>
            </div>
            <p className="border-t pt-4 text-xs text-muted-foreground">
              Añade bares y registra transacciones para ver estadísticas reales.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
