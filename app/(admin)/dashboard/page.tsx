import { Trophy, Building2, Wallet, Store, Users, Gift } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/dashboard/stat-card"
import { PeriodSelector } from "@/components/dashboard/period-selector"
import { getPoolState } from "@/lib/pozo/api"
import { getBars, getPlatformKpis } from "@/lib/bares/api"
import { getStaffSummary } from "@/lib/staff/api"
import { getTransactionsPage, getTransactionsSummary } from "@/lib/transacciones/api"
import { DEFAULT_FILTERS } from "@/lib/transacciones/types"
import { CATEGORY_META, formatGs, formatDateLong, txSign } from "@/lib/transacciones/utils"
import { parsePeriod, periodRange, PERIODS } from "@/lib/dashboard/period"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const period = parsePeriod((await searchParams).period)
  const range = periodRange(period)
  const periodLabel = PERIODS.find((p) => p.value === period)!.label.toLowerCase()

  // Estado actual (pozo, bares, personal) no depende del período; las métricas
  // de flujo (ganancia, premios, ranking) sí. Todo en paralelo.
  const [pool, bars, staff, kpis, txSummary, recent] = await Promise.all([
    getPoolState(),
    getBars(),
    getStaffSummary(),
    getPlatformKpis(range),
    getTransactionsSummary({ ...DEFAULT_FILTERS, from: range.from ?? null, to: range.to ?? null }),
    getTransactionsPage(DEFAULT_FILTERS, 8, 0),
  ])

  const activeBars = bars.filter((b) => b.status === "active").length
  const platformBalance = bars.reduce((sum, b) => sum + (b.balance ?? 0), 0)
  const prizesDelivered =
    (txSummary.byType.prize_local?.count ?? 0) +
    (txSummary.byType.prize_jackpot?.count ?? 0)

  const ranking = [...kpis.bars]
    .sort((a, b) => b.platformEarnings - a.platformEarnings)
    .slice(0, 5)
  const rankingMax = ranking[0]?.platformEarnings || 1

  const stats = [
    {
      label: "Pozo nacional",
      description: "Acumulado actual listo para el próximo ganador.",
      value: formatGs(pool.amount),
      icon: Trophy,
    },
    {
      label: "Ganancia empresa",
      description: `Ingreso de la plataforma (${periodLabel}).`,
      value: formatGs(kpis.totalPlatformEarnings),
      icon: Building2,
    },
    {
      label: "Saldo en plataforma",
      description: "Créditos disponibles en los bares ahora mismo.",
      value: formatGs(platformBalance),
      icon: Wallet,
    },
    {
      label: "Bares activos",
      description: "Locales operando con QR en vivo.",
      value: `${activeBars} / ${bars.length}`,
      icon: Store,
    },
    {
      label: "Personal habilitado",
      description: `${staff.mozos} mozos · ${staff.managers} encargados.`,
      value: staff.active,
      icon: Users,
    },
    {
      label: "Premios entregados",
      description: `Premios locales y nacionales pagados (${periodLabel}).`,
      value: prizesDelivered,
      icon: Gift,
    },
  ] as const

  return (
    <>
      {/* encabezado de página */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Panel general</h1>
          <p className="text-sm text-muted-foreground">
            Visualiza la salud de la operación y los indicadores principales del juego.
          </p>
        </div>
        <div className="ml-auto">
          <PeriodSelector value={period} />
        </div>
      </div>

      {/* métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              Últimos movimientos registrados en el ledger.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {recent.data.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">
                Aún no hay movimientos registrados.
              </p>
            ) : (
              recent.data.map((t) => {
                const meta = CATEGORY_META[t.category]
                const sign = txSign(t)
                const Icon = meta.icon
                return (
                  <div
                    key={t.id}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {t.barName ?? t.playerName ?? meta.label}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {[t.playerName, t.mozoName].filter(Boolean).join(" · ") ||
                          meta.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateLong(t.timestamp)}
                      </p>
                    </div>
                    <span
                      className={
                        "shrink-0 text-sm font-semibold tabular-nums " +
                        (sign === 1
                          ? "text-emerald-600 dark:text-emerald-400"
                          : sign === -1
                            ? "text-amber-600 dark:text-amber-500"
                            : "text-muted-foreground")
                      }
                    >
                      {sign === -1 ? "−" : sign === 1 ? "+" : ""}
                      {formatGs(t.amount)}
                    </span>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ranking de bares</CardTitle>
            <CardDescription>
              Top bares por ganancia de la empresa ({periodLabel}).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ranking.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin movimientos en el período seleccionado.
              </p>
            ) : (
              ranking.map((b, i) => (
                <div key={b.id} className="flex items-center gap-3">
                  <span className="w-5 text-sm font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{b.name}</p>
                      <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                        {formatGs(b.platformEarnings)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(b.platformEarnings / rankingMax) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Badge variant="outline" className="w-fit">
        Datos en vivo
      </Badge>
    </>
  )
}
