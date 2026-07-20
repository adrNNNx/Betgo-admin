"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Trash2 } from "lucide-react"

import type { Banner } from "@/lib/banners/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function DeleteBannerDialog({
  open,
  banner,
  onClose,
  onDelete,
}: {
  open: boolean
  banner: Banner | null
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setPending(false)
      setError(null)
    }
  }, [open])

  if (!banner) return null

  const submit = async () => {
    setPending(true)
    setError(null)
    try {
      await onDelete(banner.id)
      onClose()
    } catch (e) {
      setError((e as Error).message)
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex-row items-start gap-3 space-y-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <div className="grid gap-1">
            <DialogTitle>Eliminar banner</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-md border bg-secondary/50 p-3">
          <div className="flex h-12 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner.imageUrl} alt={banner.title} className="size-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{banner.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {banner.barId ? banner.bar?.name ?? "Bar" : "Global"}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Se eliminará el banner y su imagen en Cloudinary. No afecta a otros banners del carrusel.
        </p>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={submit} disabled={pending}>
            <Trash2 />
            {pending ? "Eliminando…" : "Eliminar banner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
