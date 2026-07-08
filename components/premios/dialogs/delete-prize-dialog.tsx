"use client"

import { useTransition } from "react"
import { AlertTriangle, Trash2 } from "lucide-react"

import type { Prize } from "@/lib/premios/types"
import { deletePrize } from "@/lib/premios/actions"
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

export function DeletePrizeDialog({
  prize,
  symbolCount,
  onClose,
}: {
  prize: Prize | null
  /** Cuántos símbolos otorgan este premio (quedarán sin premio). */
  symbolCount: number
  onClose: () => void
}) {
  const [pending, startTransition] = useTransition()

  const submit = () => {
    if (!prize) return
    startTransition(async () => {
      const ok = await withToast(() => deletePrize(prize.id), "Premio eliminado")
      if (ok) onClose()
    })
  }

  return (
    <Dialog open={Boolean(prize)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex-row items-start gap-3 space-y-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <div className="grid gap-1">
            <DialogTitle>Eliminar premio</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </div>
        </DialogHeader>

        <p className="text-sm">
          Vas a eliminar <strong>{prize?.name}</strong>
          {symbolCount > 0 && (
            <>
              {" "}
              y {symbolCount} símbolo{symbolCount === 1 ? "" : "s"} que lo{" "}
              {symbolCount === 1 ? "otorga" : "otorgan"} quedará
              {symbolCount === 1 ? "" : "n"} sin premio
            </>
          )}
          .
        </p>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={submit} disabled={pending}>
            <Trash2 />
            Eliminar premio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
