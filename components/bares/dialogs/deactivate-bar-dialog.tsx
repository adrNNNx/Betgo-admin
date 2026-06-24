"use client"

import { useTransition } from "react"
import { Power } from "lucide-react"

import type { Bar } from "@/lib/bares/types"
import { setBarActive } from "@/lib/bares/actions"
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

export function DeactivateBarDialog({
  open,
  bar,
  onClose,
}: {
  open: boolean
  bar: Bar | null
  onClose: () => void
}) {
  const [pending, startTransition] = useTransition()

  if (!bar) return null

  const submit = () => {
    startTransition(async () => {
      const ok = await withToast(
        () => setBarActive(bar.id, false),
        "Bar desactivado"
      )
      if (ok) onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex-row items-start gap-3 space-y-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-500">
            <Power className="size-5" />
          </div>
          <div className="grid gap-1">
            <DialogTitle>Desactivar bar</DialogTitle>
            <DialogDescription>
              Podés volver a activarlo cuando quieras.
            </DialogDescription>
          </div>
        </DialogHeader>

        <p className="text-sm">
          <strong>{bar.name}</strong> dejará de operar: no se podrán vender
          créditos ni registrar jugadas hasta que lo reactives.
        </p>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={pending}>
            <Power />
            Desactivar bar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
