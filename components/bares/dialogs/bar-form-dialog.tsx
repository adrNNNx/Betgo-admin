"use client"

import { useEffect, useState, useTransition } from "react"

import type { Bar } from "@/lib/bares/types"
import { slugify } from "@/lib/format"
import { DISTRIBUTION_COLORS } from "@/config/bares"
import { saveBar } from "@/lib/bares/actions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const PCT_FIELDS = [
  { key: "bar", label: "% Bar", color: DISTRIBUTION_COLORS.bar },
  { key: "pozo", label: "% Pozo", color: DISTRIBUTION_COLORS.pozo },
  { key: "empresa", label: "% Empresa", color: DISTRIBUTION_COLORS.empresa },
] as const

export function BarFormDialog({
  open,
  bar,
  onClose,
}: {
  open: boolean
  bar: Bar | null
  onClose: () => void
}) {
  const isEdit = Boolean(bar)
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [dist, setDist] = useState({ bar: 50, pozo: 30, empresa: 20 })
  const [pending, startTransition] = useTransition()

  // sincroniza al abrir
  useEffect(() => {
    if (!open) return
    setName(bar?.name ?? "")
    setLocation(bar?.location ?? "")
    setDist(bar?.distribution ?? { bar: 50, pozo: 30, empresa: 20 })
  }, [open, bar])

  const total = dist.bar + dist.pozo + dist.empresa
  const valid = total === 100 && name.trim().length > 0
  const slug = slugify(name)

  const submit = () => {
    startTransition(async () => {
      await saveBar({ id: bar?.id, name, location, distribution: dist })
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar bar" : "Registrar nuevo bar"}</DialogTitle>
          <DialogDescription>
            Define los datos del bar y cómo se reparte cada recarga.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="bar-name">Nombre</Label>
            <Input
              id="bar-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Bar Central"
            />
            <p className="text-xs text-muted-foreground">
              Slug:{" "}
              <code className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono">
                {slug}
              </code>
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bar-loc">Ubicación</Label>
            <Input
              id="bar-loc"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ciudad, barrio o referencia"
            />
            <p className="text-xs text-muted-foreground">
              Opcional, visible sólo para administradores.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Distribución de cada recarga</Label>
            <div className="grid grid-cols-3 gap-3">
              {PCT_FIELDS.map((f) => (
                <div key={f.key} className="grid gap-1.5">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={cn("size-1.5 rounded-sm", f.color)} />
                    {f.label}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={dist[f.key]}
                    onChange={(e) =>
                      setDist((d) => ({ ...d, [f.key]: Number(e.target.value) || 0 }))
                    }
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Total</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-semibold tabular-nums",
                  total === 100
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                )}
              >
                {total}%
              </span>
              <span className="text-muted-foreground">
                {total === 100
                  ? "Distribución válida."
                  : total > 100
                    ? `Te excedes por ${total - 100}%.`
                    : `Faltan ${100 - total}%.`}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!valid || pending}>
            {isEdit ? "Guardar cambios" : "Guardar bar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
