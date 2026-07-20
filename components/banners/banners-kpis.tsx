import { LayoutGrid, PlayCircle, CalendarClock, Globe } from "lucide-react"

import type { Banner } from "@/lib/banners/types"
import { computeBannerStatus, bannerScope } from "@/lib/banners/status"
import { Card, CardContent } from "@/components/ui/card"

/** Tarjetas KPI de lectura rápida sobre el estado del carrusel. */
export function BannersKpis({ banners }: { banners: Banner[] }) {
  const total = banners.length
  const live = banners.filter((b) => computeBannerStatus(b) === "active").length
  const scheduled = banners.filter((b) => computeBannerStatus(b) === "scheduled").length
  const global = banners.filter((b) => bannerScope(b) === "global").length

  const items = [
    {
      label: "Banners totales",
      value: total,
      icon: LayoutGrid,
      className: "text-foreground",
    },
    {
      label: "Activos ahora",
      value: live,
      hint: "Visibles en el carrusel público",
      icon: PlayCircle,
      className: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Programados",
      value: scheduled,
      hint: "Esperando su fecha de inicio",
      icon: CalendarClock,
      className: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Globales",
      value: global,
      hint: `${total - global} por bar`,
      icon: Globe,
      className: "text-violet-600 dark:text-violet-400",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <Card key={it.label} className="py-0">
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{it.label}</p>
              <p className="text-2xl font-semibold tabular-nums">{it.value}</p>
              {it.hint && <p className="text-xs text-muted-foreground">{it.hint}</p>}
            </div>
            <it.icon className={`size-5 shrink-0 ${it.className}`} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
