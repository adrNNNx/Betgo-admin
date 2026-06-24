"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { UploadCloud } from "lucide-react"

import type { Bar } from "@/lib/bares/types"
import { MAX_IMAGE_MB, IMAGE_ACCEPT } from "@/config/bares"
import { setBarImage } from "@/lib/bares/actions"
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
import { Label } from "@/components/ui/label"

export function BarImageDialog({
  open,
  bar,
  onClose,
}: {
  open: boolean
  bar: Bar | null
  onClose: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      setFile(null)
      setPreview(null)
      setError(null)
    }
  }, [open])

  if (!bar) return null

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

  const save = () => {
    if (!file) return
    const fd = new FormData()
    fd.append("file", file)
    startTransition(async () => {
      const ok = await withToast(() => setBarImage(bar.id, fd), "Imagen actualizada")
      if (ok) onClose()
    })
  }

  const current = preview ?? bar.imageUrl

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Imagen del bar · {bar.name}</DialogTitle>
          <DialogDescription>
            Se muestra en juegos gratuitos y del bar. Si no hay imagen, se usa SELO.png.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label>{preview ? "Vista previa" : "Imagen actual"}</Label>
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              onPick(e.dataTransfer.files?.[0])
            }}
            className="flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed bg-secondary p-4 text-center text-muted-foreground transition-colors hover:border-ring"
          >
            {current ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current} alt={bar.name} className="max-h-40 w-auto rounded-md object-contain" />
            ) : (
              <>
                <UploadCloud className="size-6" />
                <p className="text-sm font-medium text-foreground">
                  Arrastra una imagen o haz clic para subir
                </p>
                <p className="text-[11px]">
                  JPG, PNG, GIF o WEBP · máx. {MAX_IMAGE_MB}MB
                </p>
              </>
            )}
          </div>
          {current && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-left text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Reemplazar imagen…
            </button>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0])}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={!file || pending}>
            Guardar imagen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
