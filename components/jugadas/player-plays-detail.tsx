"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Phone,
  RotateCcw,
  Store,
} from "lucide-react"

import type { BarDailyPlays, Player, PlayerTodayPlays } from "@/lib/jugadas/types"
import { getPlayerTodayPlays, resetPlayerPlays } from "@/lib/jugadas/actions"
import { displayName, formatPlayDate, playsLabel } from "@/lib/jugadas/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ResetPlaysDialog,
  type ResetTarget,
} from "@/components/jugadas/dialogs/reset-plays-dialog"

type Load =
  | { kind: "loading" }
  | { kind: "ready"; data: PlayerTodayPlays }
  | { kind: "error"; message: string }

/**
 * Jugadas gratis de HOY del jugador elegido, una fila por bar, con el reinicio
 * por bar o en todos. Se monta con `key={player.id}`: cambiar de jugador
 * descarta todo el estado (incluido un diálogo abierto).
 */
export function PlayerPlaysDetail({ player }: { player: Player }) {
  const [load, setLoad] = useState<Load>({ kind: "loading" })
  const [retry, setRetry] = useState(0)
  const [target, setTargetState] = useState<ResetTarget | null>(null)
  // Cada apertura remonta el diálogo (motivo vacío, sin restos del anterior).
  const [dialogKey, setDialogKey] = useState(0)
  const setTarget = (t: ResetTarget | null) => {
    if (t) setDialogKey((k) => k + 1)
    setTargetState(t)
  }
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    getPlayerTodayPlays(player.id).then((res) => {
      if (!alive.current) return
      setLoad(res.ok ? { kind: "ready", data: res.data } : { kind: "error", message: res.error })
    })
    return () => {
      alive.current = false
    }
  }, [player.id, retry])

  // Lo que el backend sabe del jugador manda; si no, lo que vino del buscador.
  const who =
    load.kind === "ready"
      ? { name: load.data.user.name, phone: load.data.user.phone }
      : { name: player.name, phone: player.phone }
  const name = displayName(who.name)

  const confirmReset = async (reason: string): Promise<boolean> => {
    if (!target || load.kind !== "ready") return false
    const barId = target.scope === "bar" ? target.bar.barId : undefined
    const res = await resetPlayerPlays(player.id, { barId, reason })
    if (!res.ok) {
      toast.error(res.error)
      return false
    }
    const r = res.data
    // Refresco con el estado que devuelve el reset: sin GET extra.
    if (alive.current) {
      setLoad({
        kind: "ready",
        data: {
          ...load.data,
          playDate: r.playDate || load.data.playDate,
          bars: r.bars,
          totalPlaysUsed: r.bars.reduce((s, b) => s + b.playsUsed, 0),
        },
      })
    }
    if (r.resetCount === 0 || r.playsRestored === 0) {
      toast.info("No había jugadas para devolver")
    } else {
      const where =
        r.scope === "all"
          ? "en todos los bares"
          : `en ${r.bars.find((b) => b.barId === r.barId)?.barName ?? (target.scope === "bar" ? target.bar.barName : "el bar")}`
      const verb = r.playsRestored === 1 ? "Se devolvió" : "Se devolvieron"
      toast.success(`${verb} ${playsLabel(r.playsRestored)} a ${name} ${where}`)
    }
    return true
  }

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="gap-3 border-b py-5">
        <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
          <div className="min-w-0 space-y-1">
            <CardTitle className={cn("text-lg", !who.name && "text-muted-foreground")}>
              {name}
            </CardTitle>
            <p className="inline-flex items-center gap-1.5 font-mono text-sm">
              <Phone className="size-3.5 text-muted-foreground" />
              {who.phone}
            </p>
          </div>
          {load.kind === "ready" && (
            <div className="ml-auto rounded-md border bg-muted/40 px-3 py-1.5 text-right">
              <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <CalendarDays className="size-3.5" />
                Jugadas de hoy
              </p>
              <p className="text-sm font-semibold first-letter:uppercase">
                {formatPlayDate(load.data.playDate)}
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        {load.kind === "loading" && <DetailSkeleton />}

        {load.kind === "error" && (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <AlertCircle className="size-6 text-destructive" />
            <div className="space-y-1">
              <p className="text-sm font-medium">No se pudieron cargar las jugadas</p>
              <p className="text-sm text-muted-foreground">{load.message}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
                setLoad({ kind: "loading" })
                setRetry((r) => r + 1)
              }}>
              Reintentar
            </Button>
          </div>
        )}

        {load.kind === "ready" && load.data.bars.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-medium">Este jugador no usó jugadas gratis hoy</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Tiene su cupo completo en todos los bares. No hay nada que devolver.
            </p>
          </div>
        )}

        {load.kind === "ready" && load.data.bars.length > 0 && (
          <>
            <ul className="divide-y">
              {load.data.bars.map((bar) => (
                <BarRow
                  key={bar.barId}
                  bar={bar}
                  onReset={() => setTarget({ scope: "bar", bar })}
                />
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3 border-t bg-muted/30 px-6 py-4">
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium">
                  {load.data.totalPlaysUsed > 0
                    ? `${playsLabel(load.data.totalPlaysUsed)} usadas hoy en total`
                    : "No quedan jugadas usadas hoy"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Acción amplia: devuelve lo usado en los {load.data.bars.length}{" "}
                  {load.data.bars.length === 1 ? "bar" : "bares"} de una vez.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-amber-300 text-amber-800 hover:bg-amber-50 hover:text-amber-900 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
                disabled={load.data.totalPlaysUsed === 0}
                onClick={() =>
                  setTarget({
                    scope: "all",
                    bars: load.data.bars,
                    plays: load.data.totalPlaysUsed,
                  })
                }
              >
                <RotateCcw />
                Devolver en todos los bares
              </Button>
            </div>
          </>
        )}
      </CardContent>

      {load.kind === "ready" && (
        <ResetPlaysDialog
          key={dialogKey}
          open={target !== null}
          player={who}
          playDate={load.data.playDate}
          target={target}
          onClose={() => setTarget(null)}
          onConfirm={confirmReset}
        />
      )}
    </Card>
  )
}

function BarRow({ bar, onReset }: { bar: BarDailyPlays; onReset: () => void }) {
  const pct = bar.playsLimit > 0 ? Math.min(100, (bar.playsUsed / bar.playsLimit) * 100) : 0
  const none = bar.playsUsed === 0
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4">
      <div className="min-w-0 flex-1">
        <p className="inline-flex items-center gap-1.5 font-medium">
          <Store className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{bar.barName}</span>
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div
            className="h-1.5 w-full max-w-48 overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={bar.playsLimit}
            aria-valuenow={bar.playsUsed}
            aria-label={`Usadas en ${bar.barName}`}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="whitespace-nowrap text-sm tabular-nums">
            <span className="font-semibold">{bar.playsUsed}</span>
            <span className="text-muted-foreground"> / {bar.playsLimit} usadas</span>
          </span>
        </div>
      </div>
      {none ? (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-3.5" />
          Cupo completo
        </span>
      ) : null}
      <Button variant="secondary" size="sm" disabled={none} onClick={onReset}>
        <RotateCcw />
        Devolver jugadas
      </Button>
    </li>
  )
}

function DetailSkeleton() {
  return (
    <div className="divide-y" aria-busy>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-1.5 w-48" />
          </div>
          <Skeleton className="h-8 w-36" />
        </div>
      ))}
    </div>
  )
}
