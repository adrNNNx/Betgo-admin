"use client"

import { useEffect, useRef, useState } from "react"
import { UploadCloud, AlertCircle, ArrowRight } from "lucide-react"

import type { Banner } from "@/lib/banners/types"
import { MAX_IMAGE_MB, IMAGE_ACCEPT } from "@/config/banners"
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

/**
 * Reemplaza únicamente la imagen (PATCH /banners/:id/image). El backend limpia
 * la imagen anterior en Cloudinary automáticamente.
 */
export function ReplaceImageDialog({
  open,
  banner,
  onClose,
  onReplace,
}: {
  open: boolean
  banner: Banner | null
  onClose: () => void
  onReplace: (id: string, file: File) => Promise<void>
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setFile(null)
      setPreview(null)
      setError(null)
      setPending(false)
    }
  }, [open])

  if (!banner) return null

  const onPick = (f: File | undefined) => {
    if (!f) return
    if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`La imagen supera los ${MAX_IMAGE_MB}MB.`)
      return
    }
    setError(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const save = async () => {
    if (!file) return
    setPending(true)
    setError(null)
    try {
      await onReplace(banner.id, file)
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reemplazar imagen</DialogTitle>
          <DialogDescription>
            {banner.title} · La imagen anterior se eliminara automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Actual</Label>
            <div className="flex h-24 items-center justify-center overflow-hidden rounded-md border bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banner.imageUrl} alt={banner.title} className="size-full object-cover" />
            </div>
          </div>

          <ArrowRight className="mt-5 size-5 text-muted-foreground" />

          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Nueva</Label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                onPick(e.dataTransfer.files?.[0])
              }}
              className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-md border border-dashed bg-secondary text-center text-muted-foreground transition-colors hover:border-ring"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="nueva" className="size-full object-cover" />
              ) : (
                <>
                  <UploadCloud className="size-5" />
                  <p className="text-[11px]">Subir imagen</p>
                </>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">JPG, PNG, WEBP o GIF · máx. {MAX_IMAGE_MB}MB</p>
        {error && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <AlertCircle className="size-4" />
            {error}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={!file || pending}>
            {pending ? "Reemplazando…" : "Reemplazar imagen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
