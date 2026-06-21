"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { UploadCloud, Trash2 } from "lucide-react"

import type { Bar } from "@/lib/bares/types"
import { MAX_IMAGE_MB } from "@/config/bares"
import { setBarImage, removeBarImage } from "@/lib/bares/actions"
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
    fd.append("image", file)
    startTransition(async () => {
      await setBarImage(bar.id, fd)
      onClose()
    })
  }

  const remove = () => {
    startTransition(async () => {
      await removeBarImage(bar.id)
      onClose()
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
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0])}
          />
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={remove}
            disabled={!bar.imageUrl || pending}
          >
            <Trash2 />
            Eliminar imagen
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={!file || pending}>
              Guardar imagen
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
