"use client"

import { useState, useTransition } from "react"
import { AlertTriangle, Phone, Store, Trophy, User } from "lucide-react"

import type { MajorClaim } from "@/lib/pozo/types"
import { expiryLabel, urgencyOf } from "@/lib/pozo/claims"
import { deliverMajorPrize } from "@/lib/pozo/actions"
import { withToast } from "@/lib/run-action"
import { formatGs } from "@/lib/format"
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
import { cn } from "@/lib/utils"

/**
 * Confirma la entrega de un premio mayor.
 *
 * La entrega es irreversible (no hay endpoint para deshacerla) y suele ser un
 * objeto caro, así que el diálogo muestra a QUIÉN se le entrega —nombre y
 * teléfono— para que el admin pueda verificar identidad antes de confirmar.
 *
 * El llamador lo monta con `key={claim.id}`, así las notas arrancan vacías en
 * cada comprobante sin tener que resetearlas a mano.
 */
export function DeliverMajorDialog({
  claim,
  onClose,
  onDelivered,
}: {
  claim: MajorClaim
  onClose: () => void
  onDelivered: () => void
}) {
  const [notes, setNotes] = useState("")
  const [pending, startTransition] = useTransition()

  const urgency = urgencyOf(claim.expiresAt)

  const submit = () => {
    startTransition(async () => {
      const ok = await withToast(
        () => deliverMajorPrize(claim.claimCode, notes),
        `Premio entregado a ${claim.playerName ?? "el jugador"}`
      )
      if (ok) {
        onDelivered()
        onClose()
      }
    })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Entregar premio mayor</DialogTitle>
          <DialogDescription>
            Verificá la identidad del jugador antes de confirmar. Esta acción no
            se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        {/* el premio */}
        <div className="flex items-center gap-3 rounded-lg border bg-secondary/40 p-3.5">
          {claim.prizeImageUrl ? (
            <span className="grid size-11 flex-none place-items-center overflow-hidden rounded-md bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={claim.prizeImageUrl}
                alt={claim.prizeName}
                className="size-full object-cover"
              />
            </span>
          ) : (
            <span className="grid size-11 flex-none place-items-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
              <Trophy className="size-5" />
            </span>
          )}
          <div className="min-w-0">
            <div className="truncate font-semibold">{claim.prizeName}</div>
            <div className="font-mono text-xs text-muted-foreground">
              {claim.claimCode}
              {/* El valor casi siempre es null: el monto vive en el nombre. */}
              {claim.prizeValue !== null && ` · ${formatGs(claim.prizeValue)}`}
            </div>
          </div>
        </div>

        {/* a quién */}
        <div className="space-y-2 rounded-lg border p-3.5">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Entregar a
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <User className="size-4 shrink-0 text-muted-foreground" />
            {claim.playerName ?? "Jugador sin nombre"}
          </div>
          <div className="flex items-center gap-2 text-sm tabular-nums text-muted-foreground">
            <Phone className="size-4 shrink-0" />
            {claim.playerPhone ?? "Sin teléfono"}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Store className="size-4 shrink-0" />
            {claim.barName ?? "Sin bar asignado"}
          </div>
        </div>

        {urgency !== "normal" && (
          <p
            className={cn(
              "flex items-start gap-2 rounded-lg border p-3 text-[13px]",
              urgency === "vencido"
                ? "border-red-300 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
                : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
            )}
          >
            <AlertTriangle className="mt-px size-4 shrink-0" />
            <span>
              {urgency === "vencido"
                ? "Este comprobante venció y el backend va a rechazar la entrega."
                : `Este comprobante ${expiryLabel(claim.expiresAt)}.`}
            </span>
          </p>
        )}

        <div className="grid gap-2">
          <Label htmlFor="deliver-notes">Notas (opcional)</Label>
          <Textarea
            id="deliver-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Ej: verificada cédula, entregado en oficina"
          />
          <p className="text-xs text-muted-foreground">
            Queda registrado con la entrega. {notes.length}/500
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Entregando…" : "Confirmar entrega"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
