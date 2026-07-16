"use client"

import { useState, useTransition } from "react"
import { Check, Coins, Info } from "lucide-react"

import { formatNumber } from "@/lib/pozo/format"
import { QUICK_COSTS } from "@/config/pozo"
import { setCostPerSpin } from "@/lib/pozo/actions"
import { withToast } from "@/lib/run-action"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { NumberInput } from "@/components/ui/number-input"
import { Label } from "@/components/ui/label"

/** Configura el costo por tirada de la tragaperras del pozo global. */
export function GameCostConfig({
  cost,
  onSaved,
}: {
  cost: number
  onSaved?: (cost: number) => void
}) {
  const [value, setValue] = useState<number | null>(cost)
  const [pending, startTransition] = useTransition()

  const parsed = value ?? 0
  const changed = parsed !== cost
  const canSave = changed && parsed > 0 && !pending

  function save() {
    if (!canSave) return
    startTransition(async () => {
      const ok = await withToast(
        () => setCostPerSpin(parsed),
        "Costo por tirada actualizado"
      )
      if (ok) onSaved?.(parsed)
    })
  }

  return (
    <Card className="py-0">
      <CardHeader className="gap-1 border-b py-5">
        <CardTitle className="flex items-center gap-2">
          <Coins className="size-4 text-muted-foreground" />
          Configuración del juego
        </CardTitle>
        <CardDescription>
          Define cuánto cuesta cada tirada de la tragaperras del pozo global.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid items-start gap-5 py-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cost-per-spin">Costo por tirada (PYG)</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                Gs.
              </span>
              <NumberInput
                id="cost-per-spin"
                value={value}
                onValueChange={setValue}
                placeholder="0"
                className="h-11 pl-10 text-base font-semibold tabular-nums"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_COSTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setValue(q)}
                  className="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent"
                >
                  {formatNumber(q)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2.5">
            <Button disabled={!canSave} onClick={save}>
              <Check className="size-4" />
              {pending ? "Guardando…" : "Guardar costo"}
            </Button>
            <Button
              variant="ghost"
              disabled={!changed || pending}
              onClick={() => setValue(cost)}
            >
              Descartar
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-secondary/60 p-5">
          <div className="text-[12.5px] text-muted-foreground">
            Costo actual por tirada
          </div>
          <div className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
            <span className="mr-1 text-[15px] font-semibold text-muted-foreground">
              Gs.
            </span>
            {formatNumber(cost)}
          </div>
          <div className="mt-3.5 flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-px size-3.5 shrink-0" />
            <span>
              Es lo que paga el jugador por cada giro. Una parte se acumula en el
              pozo global según la distribución de cada bar.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
