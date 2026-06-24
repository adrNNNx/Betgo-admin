"use client"

import { useTransition } from "react"
import { AlertTriangle, Trash2 } from "lucide-react"

import type { BarSymbol } from "@/lib/bares/types"
import { deleteSymbol } from "@/lib/bares/actions"
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

export function DeleteSymbolDialog({
  barId,
  symbol,
  onClose,
}: {
  barId: string
  symbol: BarSymbol | null
  onClose: () => void
}) {
  const [pending, startTransition] = useTransition()

  const submit = () => {
    if (!symbol) return
    startTransition(async () => {
      const ok = await withToast(
        () => deleteSymbol(barId, symbol.id),
        "Símbolo eliminado"
      )
      if (ok) onClose()
    })
  }

  return (
    <Dialog open={Boolean(symbol)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex-row items-start gap-3 space-y-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <div className="grid gap-1">
            <DialogTitle>Eliminar símbolo</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </div>
        </DialogHeader>

        <p className="text-sm">
          Vas a eliminar el símbolo <strong>{symbol?.name}</strong> de la máquina
          de este bar.
        </p>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={submit} disabled={pending}>
            <Trash2 />
            Eliminar símbolo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
