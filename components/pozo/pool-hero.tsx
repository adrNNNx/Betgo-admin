import { Clock, Diff, Settings2 } from "lucide-react"

import type { PoolState } from "@/lib/pozo/types"
import { formatGs, formatNumber, formatStamp } from "@/lib/pozo/format"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

/**
 * Hero del pozo: saldo vigente prominente + flujo (contribuciones vs pagos) y
 * el aporte neto. Es el centro de la pantalla, no un KPI más.
 *
 * Los botones son de navegación local: el consumidor puede pasarle handlers si
 * quiere enfocar la acción manual o saltar a la pestaña de configuración.
 */
export function PoolHero({
  pool,
  onAdjust,
  onConfig,
}: {
  pool: PoolState
  onAdjust?: () => void
  onConfig?: () => void
}) {
  const net = pool.contributions - pool.payouts
  const totalFlow = pool.contributions + pool.payouts || 1
  const inPct = (pool.contributions / totalFlow) * 100

  return (
    <Card className="grid overflow-hidden p-0 lg:grid-cols-[minmax(300px,1.1fr)_1.4fr]">
      {/* saldo */}
      <div className="relative border-b p-6 lg:border-r lg:border-b-0 bg-[radial-gradient(120%_140%_at_0%_0%,var(--pool-glow),transparent_60%)] [--pool-glow:oklch(0.97_0.03_85_/_0.55)]">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-amber-700 dark:text-amber-500">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/50" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Pozo vigente
        </div>

        <div className="mt-3 text-[44px] font-bold leading-none tracking-tight tabular-nums">
          <span className="mr-1 text-[22px] font-semibold text-muted-foreground">
            Gs.
          </span>
          {formatNumber(pool.amount)}
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          Último ajuste: {formatStamp(pool.lastAdjustAt)}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button size="sm" onClick={onAdjust}>
            <Diff className="size-4" />
            Ajuste manual
          </Button>
          <Button size="sm" variant="outline" onClick={onConfig}>
            <Settings2 className="size-4" />
            Configuración
          </Button>
        </div>
      </div>

      {/* flujo */}
      <div className="flex flex-col justify-center gap-4 p-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Flujo del pozo</h4>
          <div className="text-xs text-muted-foreground">
            Aporte neto{" "}
            <strong
              className={
                net >= 0
                  ? "font-semibold tabular-nums text-emerald-600 dark:text-emerald-500"
                  : "font-semibold tabular-nums text-red-600 dark:text-red-500"
              }
            >
              {net >= 0 ? "+" : "−"}
              {formatGs(net)}
            </strong>
          </div>
        </div>

        <div className="flex h-2.5 overflow-hidden rounded-full bg-secondary">
          <span
            className="block h-full bg-emerald-500"
            style={{ width: `${inPct}%` }}
          />
          <span
            className="block h-full bg-amber-500"
            style={{ width: `${100 - inPct}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2 rounded-sm bg-emerald-500" />
              Contribuciones
            </div>
            <div className="text-base font-semibold tabular-nums">
              {formatGs(pool.contributions)}
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2 rounded-sm bg-amber-500" />
              Pagos realizados
            </div>
            <div className="text-base font-semibold tabular-nums">
              {formatGs(pool.payouts)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
