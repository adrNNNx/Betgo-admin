"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { UploadCloud } from "lucide-react"

import type { BarSymbol } from "@/lib/bares/types"
import { MAX_IMAGE_MB, IMAGE_ACCEPT } from "@/config/bares"
import { saveSymbol } from "@/lib/bares/actions"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const isImageUrl = (s: string) => /^https?:\/\//.test(s) || s.startsWith("/")

export function SymbolDialog({
  open,
  barId,
  symbol,
  onClose,
}: {
  open: boolean
  barId: string
  symbol: BarSymbol | null
  onClose: () => void
}) {
  const isEdit = Boolean(symbol)
  const [name, setName] = useState("")
  const [weight, setWeight] = useState(100)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    setName(symbol?.name ?? "")
    setWeight(symbol?.weight ?? 100)
    setFile(null)
    setPreview(null)
    setError(null)
  }, [open, symbol])

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

  // Vista previa nueva, o la imagen actual del símbolo (si ya es una URL).
  const current =
    preview ?? (symbol && isImageUrl(symbol.emoji) ? symbol.emoji : null)

  // En alta la imagen es obligatoria; en edición es opcional (se mantiene la actual).
  const valid = name.trim().length > 0 && weight >= 1 && (isEdit || file !== null)

  const submit = () => {
    const fd = new FormData()
    if (symbol?.id) fd.append("id", symbol.id)
    fd.append("name", name.trim())
    fd.append("weight", String(weight))
    if (file) fd.append("file", file)
    startTransition(async () => {
      const ok = await withToast(
        () => saveSymbol(barId, fd),
        isEdit ? "Símbolo actualizado" : "Símbolo creado"
      )
      if (ok) onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar símbolo" : "Nuevo símbolo"}</DialogTitle>
          <DialogDescription>
            Configura el símbolo de la máquina para este bar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Imagen del símbolo</Label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                onPick(e.dataTransfer.files?.[0])
              }}
              className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed bg-secondary p-4 text-center text-muted-foreground transition-colors hover:border-ring"
            >
              {current ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current}
                  alt={name || "símbolo"}
                  className="max-h-28 w-auto rounded-md object-contain"
                />
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

          <div className="grid gap-2">
            <Label htmlFor="sym-name">Nombre</Label>
            <Input
              id="sym-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Seven"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sym-weight">Peso</Label>
            <Input
              id="sym-weight"
              type="number"
              min={1}
              max={1000}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Mayor peso = aparece más seguido. Entre 1 y 1000.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!valid || pending}>
            {isEdit ? "Guardar cambios" : "Crear símbolo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
