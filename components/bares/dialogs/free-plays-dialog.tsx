"use client"

import { useEffect, useState, useTransition } from "react"
import { Gift, Minus, Plus } from "lucide-react"

import type { Bar } from "@/lib/bares/types"
import { FREE_PLAYS_MAX } from "@/config/bares"
import { setFreePlays } from "@/lib/bares/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export function FreePlaysDialog({
  open,
  bar,
  onClose,
}: {
  open: boolean
  bar: Bar | null
  onClose: () => void
}) {
  const [value, setValue] = useState(0)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (open && bar) setValue(bar.freePlaysPerDay)
  }, [open, bar])

  if (!bar) return null

  const clamp = (n: number) => Math.max(0, Math.min(FREE_PLAYS_MAX, n))

  const submit = () => {
    startTransition(async () => {
      await setFreePlays(bar.id, value)
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Jugadas gratuitas · {bar.name}</DialogTitle>
          <DialogDescription>
            Cuántas jugadas gratis se permiten por día en este bar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 rounded-lg bg-secondary px-4 py-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Configuración actual</p>
            <p className="text-2xl font-bold tracking-tight tabular-nums">
              {value} por día
            </p>
          </div>
          <Gift className="size-7 text-muted-foreground" />
        </div>

        <div className="grid gap-3">
          <Label>Jugadas gratuitas por día</Label>
          <div className="flex items-center gap-4">
            <Slider
              min={0}
              max={FREE_PLAYS_MAX}
              step={1}
              value={[value]}
              onValueChange={([v]) => setValue(v)}
              className="flex-1"
            />
            <div className="flex items-center rounded-md border">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-r-none"
                onClick={() => setValue((v) => clamp(v - 1))}
              >
                <Minus />
              </Button>
              <span className="w-10 text-center text-base font-semibold tabular-nums">
                {value}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-l-none"
                onClick={() => setValue((v) => clamp(v + 1))}
              >
                <Plus />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Entre 0 y {FREE_PLAYS_MAX}. Si es 0, no se permiten jugadas gratuitas.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={pending}>
            Guardar configuración
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
