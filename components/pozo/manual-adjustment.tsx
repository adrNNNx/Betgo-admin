"use client"

import { useId, useState, useTransition } from "react"
import { AlertTriangle, Check, Diff, Minus, Plus } from "lucide-react"

import type { AdjustDirection, PoolState } from "@/lib/pozo/types"
import { formatGs, formatNumber } from "@/lib/pozo/format"
import { QUICK_AMOUNTS } from "@/config/pozo"
import { applyManualAdjust } from "@/lib/pozo/actions"
import { withToast } from "@/lib/run-action"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/**
 * Acción manual sobre el pozo. Toggle explícito Sumar / Restar + montos rápidos
 * + vista previa en vivo, con guardia si el resultado sería negativo.
 */
export function ManualAdjustment({
  pool,
  onApplied,
}: {
  pool: PoolState
  onApplied?: (nextPool: PoolState) => void
}) {
  const cardId = useId()
  const [direction, setDirection] = useState<AdjustDirection>("add")
  const [amountRaw, setAmountRaw] = useState("")
  const [notes, setNotes] = useState("")
  const [pending, startTransition] = useTransition()

  const amount = Math.max(0, Number(amountRaw) || 0)
  const signed = direction === "add" ? amount : -amount
  const result = pool.amount + signed
  const negative = result < 0
  const reason = notes.trim()
  const canApply = amount > 0 && !negative && reason.length > 0 && !pending

  function reset() {
    setAmountRaw("")
    setNotes("")
  }

  function apply() {
    if (!canApply) return
    startTransition(async () => {
      const ok = await withToast(
        () => applyManualAdjust({ amount, direction, notes: reason }),
        direction === "add" ? "Saldo sumado al pozo" : "Saldo restado del pozo"
      )
      if (!ok) return
      // El backend solo mueve el saldo en un ajuste (no toca contribuciones/pagos).
      // El historial se recarga aparte (refreshToken) para traer el movimiento real.
      onApplied?.({ ...pool, amount: result, lastAdjustAt: new Date().toISOString() })
      reset()
    })
  }

  return (
    <Card id="pozo-manual" className="scroll-mt-6 py-0">
      <CardHeader className="gap-1 border-b py-5">
        <CardTitle className="flex items-center gap-2">
          <Diff className="size-4 text-muted-foreground" />
          Acción manual
        </CardTitle>
        <CardDescription>
          Suma o resta saldo del pozo dejando registro. Cada ajuste queda en el
          historial.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5 py-6 lg:grid-cols-[1.15fr_1fr]">
        {/* formulario */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de ajuste</Label>
            <ToggleGroup
              type="single"
              value={direction}
              onValueChange={(v) => v && setDirection(v as AdjustDirection)}
              variant="outline"
              className="w-full"
            >
              <ToggleGroupItem
                value="add"
                className="flex-1 data-[state=on]:text-emerald-600 dark:data-[state=on]:text-emerald-500"
              >
                <Plus className="size-4" />
                Sumar al pozo
              </ToggleGroupItem>
              <ToggleGroupItem
                value="sub"
                className="flex-1 data-[state=on]:text-red-600 dark:data-[state=on]:text-red-500"
              >
                <Minus className="size-4" />
                Restar del pozo
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${cardId}-amount`}>
              Monto <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                Gs.
              </span>
              <Input
                id={`${cardId}-amount`}
                type="number"
                min={0}
                inputMode="numeric"
                value={amountRaw}
                onChange={(e) => setAmountRaw(e.target.value)}
                placeholder="0"
                className="h-11 pl-10 text-base font-semibold tabular-nums"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmountRaw(String(amount + q))}
                  className="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent"
                >
                  {formatNumber(q)}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresa un monto positivo; el tipo de ajuste define si suma o resta.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${cardId}-notes`}>
              Motivo <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`${cardId}-notes`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Motivo del ajuste (obligatorio): referencia, corrección, etc."
              className="min-h-20"
            />
          </div>
        </div>

        {/* vista previa */}
        <div className="flex flex-col justify-center gap-3.5 rounded-lg border bg-secondary/60 p-5">
          <Row label="Pozo actual" value={formatGs(pool.amount)} />
          <Row
            label={direction === "add" ? "Sumar" : "Restar"}
            value={`${signed >= 0 ? "+" : "−"}${formatGs(amount)}`}
            tone={direction === "add" ? "pos" : "neg"}
          />
          <div className="h-px bg-border" />
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold">Pozo resultante</span>
            <span className="text-2xl font-bold tracking-tight tabular-nums">
              <span className="mr-1 text-sm font-semibold text-muted-foreground">
                Gs.
              </span>
              {formatNumber(result)}
            </span>
          </div>

          {negative && (
            <div className="flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-2 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-500">
              <AlertTriangle className="size-3.5 shrink-0" />
              El resultado sería negativo. Revisa el monto.
            </div>
          )}

          <div className="mt-1 flex gap-2.5">
            <Button className="flex-1" disabled={!canApply} onClick={apply}>
              <Check className="size-4" />
              {pending ? "Aplicando…" : "Aplicar ajuste"}
            </Button>
            <Button variant="outline" onClick={reset} disabled={pending}>
              Limpiar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Row({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "pos" | "neg"
}) {
  const toneClass =
    tone === "pos"
      ? "text-emerald-600 dark:text-emerald-500"
      : tone === "neg"
        ? "text-red-600 dark:text-red-500"
        : ""
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[12.5px] text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${toneClass}`}>
        {value}
      </span>
    </div>
  )
}
