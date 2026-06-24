"use client"

import { useEffect, useState, useTransition } from "react"
import { Wallet } from "lucide-react"

import type { Bar } from "@/lib/bares/types"
import { formatGs } from "@/lib/format"
import { rechargeBalance } from "@/lib/bares/actions"
import { withToast } from "@/lib/run-action"
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
import { Textarea } from "@/components/ui/textarea"

const QUICK = [50_000, 100_000, 500_000, 1_000_000]

export function RechargeDialog({
  open,
  bar,
  onClose,
}: {
  open: boolean
  bar: Bar | null
  onClose: () => void
}) {
  const [amount, setAmount] = useState(0)
  const [notes, setNotes] = useState("")
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      setAmount(0)
      setNotes("")
    }
  }, [open])

  if (!bar) return null

  // Mismo reparto que el backend (recharge-split.ts): empresa = remanente para
  // que las 3 partes sumen exactamente el monto. Guaraníes → enteros.
  const barShare = Math.round((amount * bar.distribution.bar) / 100)
  const poolShare = Math.round((amount * bar.distribution.pozo) / 100)
  const platformShare = amount - barShare - poolShare

  const submit = () => {
    startTransition(async () => {
      const ok = await withToast(
        () => rechargeBalance(bar.id, amount, notes),
        "Saldo recargado"
      )
      if (ok) onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recargar saldo · {bar.name}</DialogTitle>
          <DialogDescription>
            Agrega saldo al bar para que los mozos vendan créditos.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-secondary px-4 py-3">
          <p className="text-xs text-muted-foreground">Saldo actual</p>
          <p className="text-2xl font-bold tracking-tight tabular-nums">
            {formatGs(bar.balance)}
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="amount">Monto a recargar (PYG)</Label>
          <Input
            id="amount"
            type="number"
            min={0}
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            placeholder="0"
            className="tabular-nums"
          />
          <div className="flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <Button
                key={q}
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setAmount((a) => a + q)}
              >
                +{new Intl.NumberFormat("es-PY").format(q)}
              </Button>
            ))}
          </div>
        </div>

        {amount > 0 && (
          // El monto se reparte según la distribución del bar: solo `barShare`
          // entra al saldo del bar; el resto va al pozo y a la empresa.
          <dl className="grid gap-1.5 rounded-lg border px-4 py-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">
                Al bar <span className="tabular-nums">({bar.distribution.bar}%)</span>
              </dt>
              <dd className="font-medium tabular-nums">{formatGs(barShare)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">
                Al pozo <span className="tabular-nums">({bar.distribution.pozo}%)</span>
              </dt>
              <dd className="font-medium tabular-nums">{formatGs(poolShare)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">
                Empresa <span className="tabular-nums">({bar.distribution.empresa}%)</span>
              </dt>
              <dd className="font-medium tabular-nums">{formatGs(platformShare)}</dd>
            </div>
            <div className="mt-1 flex items-center justify-between border-t pt-2">
              <dt className="text-muted-foreground">Nuevo saldo del bar</dt>
              <dd className="font-semibold tabular-nums">
                {formatGs(bar.balance + barShare)}
              </dd>
            </div>
          </dl>
        )}

        <div className="grid gap-2">
          <Label htmlFor="notes">
            Notas <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Motivo de la recarga, referencia, etc."
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={amount <= 0 || pending}>
            <Wallet />
            Recargar saldo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
