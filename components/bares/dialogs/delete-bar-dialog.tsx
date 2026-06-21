"use client"

import { useEffect, useState, useTransition } from "react"
import { AlertTriangle, Trash2 } from "lucide-react"

import type { Bar } from "@/lib/bares/types"
import { deleteBar } from "@/lib/bares/actions"
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

export function DeleteBarDialog({
  open,
  bar,
  onClose,
}: {
  open: boolean
  bar: Bar | null
  onClose: () => void
}) {
  const [confirm, setConfirm] = useState("")
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (open) setConfirm("")
  }, [open])

  if (!bar) return null

  const canDelete = confirm.trim() === bar.slug

  const submit = () => {
    startTransition(async () => {
      await deleteBar(bar.id)
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex-row items-start gap-3 space-y-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <div className="grid gap-1">
            <DialogTitle>Eliminar bar</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </div>
        </DialogHeader>

        <p className="text-sm">
          Vas a eliminar <strong>{bar.name}</strong> y toda su configuración (saldo,
          símbolos e imágenes). Escribe{" "}
          <code className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-xs">
            {bar.slug}
          </code>{" "}
          para confirmar.
        </p>
        <Input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={bar.slug}
          autoComplete="off"
        />

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={submit} disabled={!canDelete || pending}>
            <Trash2 />
            Eliminar bar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
