"use client"

import { useState, useTransition } from "react"
import { AlertTriangle, Phone, Store, User } from "lucide-react"

import type { JackpotClaim } from "@/lib/pozo/types"
import { markJackpotPaid } from "@/lib/pozo/actions"
import { withToast } from "@/lib/run-action"
import { formatGs } from "@/lib/format"
import { formatStamp } from "@/lib/pozo/format"
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
import { Textarea } from "@/components/ui/textarea"

/**
 * Confirma el pago de un pozo ganado.
 *
 * Es plata real y no se puede deshacer: no hay endpoint para revertirlo y el
 * monto se suma a `total_paid` del pozo global. Por eso el diálogo muestra el
 * monto, el folio y a quién se le paga antes de habilitar la confirmación.
 *
 * Se monta con `key={claim.id}` para que las notas arranquen vacías en cada uno.
 */
export function PayJackpotDialog({
  claim,
  onClose,
  onPaid,
}: {
  claim: JackpotClaim
  onClose: () => void
  onPaid: () => void
}) {
  const [notes, setNotes] = useState("")
  const [pending, startTransition] = useTransition()

  const submit = () => {
    startTransition(async () => {
      const ok = await withToast(
        () => markJackpotPaid(claim.folio, notes),
        `Pozo ${claim.folio} marcado como pagado`
      )
      if (ok) {
        onPaid()
        onClose()
      }
    })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Marcar pozo como pagado</DialogTitle>
          <DialogDescription>
            Confirmá sólo después de haber hecho la transferencia. Esta acción no
            se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        {/* El monto es lo primero: es lo que se está por dar por transferido. */}
        <div className="rounded-lg border bg-secondary/40 p-4 text-center">
          <div className="text-[12px] text-muted-foreground">Monto a pagar</div>
          <div className="mt-0.5 text-3xl font-bold tracking-tight tabular-nums">
            {formatGs(claim.amount)}
          </div>
          <div className="mt-1 font-mono text-xs text-muted-foreground">
            {claim.folio}
          </div>
        </div>

        <div className="space-y-2 rounded-lg border p-3.5">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Pagar a
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <User className="size-4 shrink-0 text-muted-foreground" />
            {claim.playerName ?? "Ganador sin nombre"}
          </div>
          <div className="flex items-center gap-2 text-sm tabular-nums text-muted-foreground">
            <Phone className="size-4 shrink-0" />
            {claim.playerPhone ?? "Sin teléfono"}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Store className="size-4 shrink-0" />
            {claim.barName ?? "Sin bar asignado"}
          </div>
          <div className="border-t pt-2 text-xs text-muted-foreground">
            Ganado el {formatStamp(claim.playedAt)}
            {claim.contactedAt && ` · escribió el ${formatStamp(claim.contactedAt)}`}
          </div>
        </div>

        {claim.status === "pending_contact" && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3.5 text-[13px] text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="mt-px size-4 shrink-0" />
            <span>
              Este ganador todavía no se comunicó. Verificá que la transferencia
              realmente se hizo antes de cerrarlo.
            </span>
          </p>
        )}

        <div className="grid gap-2">
          <Label htmlFor="pay-notes">Referencia del pago (opcional)</Label>
          <Textarea
            id="pay-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Ej: Transferencia 998877"
          />
          <p className="text-xs text-muted-foreground">
            Queda registrada con el pago. {notes.length}/500
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Guardando…" : `Confirmar pago de ${formatGs(claim.amount)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
