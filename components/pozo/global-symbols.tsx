"use client"

import { useState, useTransition } from "react"
import {
  AlertTriangle,
  Crown,
  Dices,
  Gift,
  Link as LinkIcon,
  Pencil,
  Plus,
} from "lucide-react"

import type { GlobalSymbol, MatchLevel } from "@/lib/pozo/types"
import { formatPct } from "@/lib/pozo/format"
import {
  combinedSpinsPerWin,
  formatOdds,
  jackpotOddsLevel,
  oddsLevel,
  spinsPerWin,
} from "@/lib/pozo/odds"
import { setSymbolJackpot, setSymbolMinMatch } from "@/lib/pozo/actions"
import { withToast } from "@/lib/run-action"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SymbolFormDialog } from "@/components/pozo/dialogs/symbol-form-dialog"
import { cn } from "@/lib/utils"

type DialogState = { open: boolean; symbol: GlobalSymbol | null }

const MATCH_OPTIONS: MatchLevel[] = [3, 4, 5]

/** Color del aviso de frecuencia según qué tan seguido paga. */
const ODDS_CLASS: Record<ReturnType<typeof oddsLevel>, string> = {
  extremo: "text-red-600 dark:text-red-400",
  alto: "text-amber-600 dark:text-amber-500",
  normal: "text-muted-foreground",
  raro: "text-muted-foreground",
}

/**
 * Símbolos del pozo global: alta / edición / borrado, el premio que otorga
 * cada uno, y desde cuántos carriles iguales lo paga.
 *
 * El premio lo define el símbolo, no un nivel global: por eso la frecuencia se
 * calcula por símbolo cruzando su peso con su umbral, y se muestra al lado del
 * control que la cambia.
 */
export function GlobalSymbols({
  symbols,
  onAssign,
}: {
  symbols: GlobalSymbol[]
  onAssign: (symbol: GlobalSymbol) => void
}) {
  const [dialog, setDialog] = useState<DialogState>({ open: false, symbol: null })
  // Marcar quién entrega el pozo siempre pasa por confirmación: es plata real
  // y el peso del símbolo decide cada cuánto se vacía.
  const [confirming, setConfirming] = useState<GlobalSymbol | null>(null)
  const [pending, startTransition] = useTransition()

  const totalWeight = symbols.reduce((a, s) => a + (s.weight || 0), 0) || 1
  const withPrize = symbols.filter((s) => s.hasPrize).length
  const sorted = [...symbols].sort((a, b) => b.weight - a.weight)

  const jackpotSymbols = symbols.filter((s) => s.isJackpot)
  const combined = combinedSpinsPerWin(
    symbols.map((s) => ({
      weight: s.weight,
      minMatch: s.minMatch,
      pays: s.hasPrize,
    }))
  )
  const jackpotOdds = combinedSpinsPerWin(
    symbols.map((s) => ({ weight: s.weight, minMatch: 5, pays: s.isJackpot }))
  )
  const jackpotLevel = jackpotOddsLevel(jackpotOdds)
  const jackpotWarn =
    jackpotSymbols.length > 0 &&
    (jackpotLevel === "extremo" || jackpotLevel === "alto")

  const changeMatch = (s: GlobalSymbol, value: MatchLevel) => {
    if (value === s.minMatch) return
    startTransition(() => {
      withToast(
        () => setSymbolMinMatch(s.id, value),
        value === 5
          ? `${s.name} paga sólo con los 5`
          : `${s.name} paga desde ${value} iguales`
      )
    })
  }

  const toggleJackpot = (s: GlobalSymbol) => {
    // Quitar la corona es la dirección segura: va directo.
    if (s.isJackpot) {
      startTransition(() => {
        withToast(
          () => setSymbolJackpot(s.id, false),
          `${s.name} ya no entrega el pozo`
        )
      })
      return
    }
    setConfirming(s)
  }

  const confirmJackpot = () => {
    const s = confirming
    if (!s) return
    startTransition(async () => {
      const ok = await withToast(
        () => setSymbolJackpot(s.id, true),
        `${s.name} entrega el pozo con 5 iguales`
      )
      if (ok) setConfirming(null)
    })
  }

  return (
    <>
      <Card className="py-0">
        <CardHeader className="flex-row items-center gap-4 border-b py-5">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Dices className="size-4 text-muted-foreground" />
              Símbolos del pozo global
            </CardTitle>
            <CardDescription>
              Cada símbolo define qué premio da y desde cuántos carriles iguales
              lo paga. El pozo sólo lo entregan los marcados con corona, y siempre
              con los 5.
            </CardDescription>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline">
              {symbols.length} símbolos · {withPrize} con premio
            </span>
            <Button size="sm" onClick={() => setDialog({ open: true, symbol: null })}>
              <Plus className="size-4" />
              Nuevo símbolo
            </Button>
          </div>
        </CardHeader>

        {/* resumen de lo que produce la config actual */}
        <div className="flex flex-wrap gap-x-8 gap-y-3 border-b bg-secondary/40 px-6 py-4">
          <Summary
            label="Premio menor"
            value={
              combined === null
                ? "ningún símbolo paga"
                : formatOdds(combined)
            }
            className={
              combined === null
                ? "text-amber-600 dark:text-amber-500"
                : ODDS_CLASS[oddsLevel(combined)]
            }
          />
          <Summary
            label="Pozo global"
            value={
              jackpotOdds === null ? "nadie lo entrega" : formatOdds(jackpotOdds)
            }
            className={
              jackpotOdds === null
                ? "text-amber-600 dark:text-amber-500"
                : ODDS_CLASS[jackpotOddsLevel(jackpotOdds)]
            }
          />
          <Summary
            label="Símbolos que dan el pozo"
            value={
              jackpotSymbols.length === 0
                ? "ninguno"
                : jackpotSymbols.map((s) => s.name).join(", ")
            }
          />
        </div>

        <CardContent className="py-6">
          {jackpotSymbols.length === 0 && (
            <p className="mb-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              Ningún símbolo entrega el pozo global, así que hoy nadie puede
              ganarlo. Activá &quot;Entrega el pozo&quot; en el símbolo que lo
              reparte — conviene uno de peso bajo.
            </p>
          )}

          {/* El peso se edita aparte, así que la advertencia del diálogo no
              alcanza: hay que avisar mientras el problema siga en pie. */}
          {jackpotWarn && jackpotOdds !== null && (
            <p
              className={cn(
                "mb-5 flex items-start gap-2.5 rounded-lg border px-4 py-3 text-[13px]",
                jackpotLevel === "extremo"
                  ? "border-red-300 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
                  : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
              )}
            >
              <AlertTriangle className="mt-px size-4 shrink-0" />
              <span>
                {jackpotSymbols.map((s) => s.name).join(" y ")}{" "}
                {jackpotSymbols.length > 1 ? "entregan" : "entrega"} el pozo{" "}
                <strong>{formatOdds(jackpotOdds)}</strong>.{" "}
                {jackpotLevel === "extremo"
                  ? "Es demasiado seguido: el pozo no llega a crecer entre un ganador y el siguiente. Bajale el peso o pasá la corona a un símbolo más raro."
                  : "Revisá que el pozo alcance a acumular lo que querés pagar."}
              </span>
            </p>
          )}

          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3.5">
            {sorted.map((s) => {
              const prob = ((s.weight || 0) / totalWeight) * 100
              const spins = spinsPerWin(s.weight, totalWeight, s.minMatch)
              const level = oddsLevel(spins)
              // El pozo siempre exige los 5, no el umbral del símbolo.
              const jackpotSpins = spinsPerWin(s.weight, totalWeight, 5)

              return (
                <div
                  key={s.id}
                  className={cn(
                    "group relative flex flex-col items-center gap-2 rounded-lg border p-4 pt-[18px] transition-shadow hover:shadow-sm",
                    s.isJackpot
                      ? "border-amber-400/70 bg-amber-50/40 dark:border-amber-700/60 dark:bg-amber-950/20"
                      : "hover:border-ring"
                  )}
                >
                  <button
                    type="button"
                    title="Editar símbolo"
                    onClick={() => setDialog({ open: true, symbol: s })}
                    className="absolute right-2 top-2 grid size-7 place-items-center rounded-sm border bg-background text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100"
                  >
                    <Pencil className="size-3.5" />
                  </button>

                  <SymbolThumb symbol={s} />
                  <div className="flex items-center gap-1.5 text-sm font-semibold">
                    {s.name}
                    {s.isJackpot && (
                      <Crown className="size-3.5 shrink-0 text-amber-500" />
                    )}
                  </div>

                  <div className="mt-1 w-full">
                    <div className="flex items-baseline justify-between text-[11.5px] text-muted-foreground">
                      <span>Peso {s.weight}</span>
                      <span className="font-semibold tabular-nums text-foreground">
                        {formatPct(prob)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-[width]"
                        style={{ width: `${Math.max(2, prob)}%` }}
                      />
                    </div>
                  </div>

                  {/* El que entrega el pozo no tiene premio propio ni umbral
                      configurable: siempre exige los 5. Por eso no mostramos
                      controles que el backend igual va a ignorar o rechazar. */}
                  {s.isJackpot ? (
                    <div className="mt-2 w-full space-y-1.5">
                      <p className="rounded-md bg-amber-100/70 px-2.5 py-1.5 text-center text-[11px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        Entrega el pozo con los 5
                      </p>
                      <p
                        className={cn(
                          "text-center text-[11px] font-medium",
                          ODDS_CLASS[jackpotOddsLevel(jackpotSpins)]
                        )}
                      >
                        El pozo se vacía {formatOdds(jackpotSpins)}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* desde cuántos iguales paga + qué tan seguido cae */}
                      <div className="mt-2 w-full space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-medium text-muted-foreground">
                            Paga desde
                          </span>
                          <ToggleGroup
                            type="single"
                            size="sm"
                            variant="outline"
                            value={String(s.minMatch)}
                            onValueChange={(v) =>
                              v && changeMatch(s, Number(v) as MatchLevel)
                            }
                            disabled={pending}
                          >
                            {MATCH_OPTIONS.map((n) => (
                              <ToggleGroupItem
                                key={n}
                                value={String(n)}
                                className="h-7 w-8 text-xs"
                                aria-label={`Paga desde ${n} iguales`}
                              >
                                {n}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                        </div>
                        <p
                          className={cn(
                            "text-center text-[11px] font-medium",
                            ODDS_CLASS[level]
                          )}
                        >
                          {s.hasPrize ? formatOdds(spins) : "no paga nada"}
                        </p>
                      </div>

                      {/* premio asignado + acción */}
                      <div className="mt-0.5 w-full">
                        {s.hasPrize ? (
                          <span className="flex w-full items-center justify-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10.5px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-500">
                            <Gift className="size-3 shrink-0" />
                            <span className="truncate">
                              {s.prizeName ?? "Con premio"}
                            </span>
                          </span>
                        ) : (
                          <span className="block rounded-full bg-secondary px-2.5 py-0.5 text-center text-[10.5px] font-medium text-muted-foreground">
                            Sin premio
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="xs"
                          className="mt-1.5 w-full text-muted-foreground"
                          onClick={() => onAssign(s)}
                        >
                          <LinkIcon className="size-3" />
                          {s.hasPrize ? "Cambiar premio" : "Asignar premio"}
                        </Button>
                      </div>
                    </>
                  )}

                  {/* siempre visible: decide quién se lleva el pozo nacional */}
                  <label className="mt-2 flex w-full cursor-pointer items-center justify-between gap-2 border-t pt-2.5">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                      <Crown className="size-3 shrink-0" />
                      Entrega el pozo
                    </span>
                    <Switch
                      checked={s.isJackpot}
                      disabled={pending}
                      onCheckedChange={() => toggleJackpot(s)}
                      aria-label={`${s.name} entrega el pozo global`}
                    />
                  </label>
                </div>
              )
            })}

            <button
              type="button"
              onClick={() => setDialog({ open: true, symbol: null })}
              className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
            >
              <Plus className="size-5" />
              <span className="text-sm font-medium">Nuevo símbolo</span>
            </button>
          </div>
        </CardContent>
      </Card>

      <SymbolFormDialog
        open={dialog.open}
        symbol={dialog.symbol}
        onClose={() => setDialog({ open: false, symbol: null })}
      />

      <ConfirmJackpotDialog
        symbol={confirming}
        totalWeight={totalWeight}
        pending={pending}
        onConfirm={confirmJackpot}
        onClose={() => setConfirming(null)}
      />
    </>
  )
}

/**
 * Confirma marcar el símbolo que entrega el pozo. Muestra las dos cosas que
 * el admin no puede ver solo: cada cuánto se vacía el pozo con ESE peso, y que
 * el premio propio se pierde (el backend no acepta las dos cosas juntas).
 */
function ConfirmJackpotDialog({
  symbol,
  totalWeight,
  pending,
  onConfirm,
  onClose,
}: {
  symbol: GlobalSymbol | null
  totalWeight: number
  pending: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  if (!symbol) return null

  const spins = spinsPerWin(symbol.weight, totalWeight, 5)
  const level = jackpotOddsLevel(spins)
  const prob = ((symbol.weight || 0) / totalWeight) * 100

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Que {symbol.name} entregue el pozo global
          </DialogTitle>
          <DialogDescription>
            Al alinear los 5 carriles, el jugador se lleva el pozo acumulado
            completo y el pozo vuelve a su mínimo.
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            "rounded-lg border p-4",
            level === "extremo"
              ? "border-red-300 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30"
              : level === "alto"
                ? "border-amber-300 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30"
                : "bg-secondary/60"
          )}
        >
          <div className="text-[12px] text-muted-foreground">
            Con peso {symbol.weight} ({prob.toFixed(1)}% por carril), el pozo se
            vaciaría
          </div>
          <div
            className={cn(
              "mt-1 text-xl font-bold tracking-tight",
              ODDS_CLASS[level]
            )}
          >
            {formatOdds(spins)}
          </div>
          {level === "extremo" && (
            <p className="mt-2.5 flex items-start gap-2 text-[12.5px] font-medium text-red-700 dark:text-red-400">
              <AlertTriangle className="mt-px size-3.5 shrink-0" />
              <span>
                Es demasiado seguido: el pozo no llega a crecer entre un ganador
                y el siguiente. Bajale el peso al símbolo o elegí uno más raro.
              </span>
            </p>
          )}
          {level === "alto" && (
            <p className="mt-2.5 flex items-start gap-2 text-[12.5px] text-amber-800 dark:text-amber-300">
              <AlertTriangle className="mt-px size-3.5 shrink-0" />
              <span>
                Sale bastante seguido. Revisá que el pozo alcance a acumular lo
                que querés pagar.
              </span>
            </p>
          )}
        </div>

        {symbol.hasPrize && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3.5 text-[13px] text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="mt-px size-4 shrink-0" />
            <span>
              Se le va a quitar el premio{" "}
              <strong>{symbol.prizeName ?? "asignado"}</strong>. El que entrega
              el pozo no puede tener premio propio: el pozo es plata, no un
              premio de la lista.
            </span>
          </p>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={pending} onClick={onConfirm}>
            {pending ? "Guardando…" : "Sí, que entregue el pozo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Summary({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className="space-y-0.5">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={cn("text-sm font-semibold", className)}>{value}</div>
    </div>
  )
}

function SymbolThumb({ symbol }: { symbol: GlobalSymbol }) {
  if (symbol.imageUrl) {
    return (
      <div className="grid size-[60px] place-items-center overflow-hidden rounded-md bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={symbol.imageUrl} alt={symbol.name} className="size-full object-cover" />
      </div>
    )
  }
  return (
    <div className="grid size-[60px] place-items-center rounded-md bg-secondary text-[34px] leading-none">
      {symbol.emoji}
    </div>
  )
}
