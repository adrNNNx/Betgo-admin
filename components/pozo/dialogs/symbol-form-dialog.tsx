"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { Check, Minus, Plus, Smile, Trash2, UploadCloud } from "lucide-react"

import type { GlobalSymbol } from "@/lib/pozo/types"
import {
  MAX_SYMBOL_WEIGHT,
  MIN_SYMBOL_WEIGHT,
  SYMBOL_EMOJIS,
} from "@/config/pozo"
import { MAX_IMAGE_MB, IMAGE_ACCEPT } from "@/config/bares"
import { deleteSymbol as deleteSymbolAction, saveSymbol } from "@/lib/pozo/actions"
import { withToast } from "@/lib/run-action"
import { cn } from "@/lib/utils"
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
import { Slider } from "@/components/ui/slider"

/**
 * Alta / edición / borrado de un símbolo del pozo global. La imagen propia es
 * lo principal (dropzone → Cloudinary); el emoji queda como fallback detrás de
 * un botón. Los premios se asignan en el módulo Premios (ámbito Pozo nacional).
 */
export function SymbolFormDialog({
  open,
  symbol,
  onClose,
}: {
  open: boolean
  symbol: GlobalSymbol | null
  onClose: () => void
}) {
  const editing = Boolean(symbol)
  const [name, setName] = useState("")
  const [weight, setWeight] = useState(2)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [emoji, setEmoji] = useState<string | null>(null)
  const [showEmoji, setShowEmoji] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    setName(symbol?.name ?? "")
    setWeight(symbol?.weight ?? 2)
    setFile(null)
    setPreview(null)
    // Si el símbolo actual usa emoji (no imagen), lo precargamos como fallback.
    const currentEmoji = symbol && !symbol.imageUrl ? symbol.emoji : null
    setEmoji(currentEmoji)
    setShowEmoji(Boolean(currentEmoji))
    setError(null)
  }, [open, symbol])

  const clamp = (n: number) =>
    Math.max(MIN_SYMBOL_WEIGHT, Math.min(MAX_SYMBOL_WEIGHT, n))

  const onPickFile = (f: File | undefined) => {
    if (!f) return
    if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`La imagen supera los ${MAX_IMAGE_MB}MB.`)
      return
    }
    setError(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setEmoji(null) // la imagen manda sobre el emoji
  }

  const onPickEmoji = (e: string) => {
    setEmoji(e)
    setFile(null)
    setPreview(null)
  }

  const imageSrc = preview ?? symbol?.imageUrl ?? null
  const canSave = name.trim().length > 0 && (editing || file !== null || emoji !== null) && !pending

  function save() {
    if (!canSave) return
    const fd = new FormData()
    if (symbol?.id) fd.append("id", symbol.id)
    fd.append("name", name.trim())
    fd.append("weight", String(weight))
    if (file) fd.append("file", file)
    else if (emoji) fd.append("emoji", emoji)

    startTransition(async () => {
      const ok = await withToast(
        () => saveSymbol(fd),
        editing ? "Símbolo actualizado" : "Símbolo creado"
      )
      if (ok) onClose()
    })
  }

  function remove() {
    if (!symbol) return
    startTransition(async () => {
      const ok = await withToast(
        () => deleteSymbolAction(symbol.id),
        "Símbolo eliminado"
      )
      if (ok) onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar símbolo" : "Nuevo símbolo"}</DialogTitle>
          <DialogDescription>
            Configura un símbolo de la tragaperras del pozo global.
          </DialogDescription>
        </DialogHeader>

        {/* imagen — principal */}
        <div className="grid gap-2">
          <Label>Imagen del símbolo</Label>
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              onPickFile(e.dataTransfer.files?.[0])
            }}
            className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed bg-secondary p-4 text-center text-muted-foreground transition-colors hover:border-ring"
          >
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt={name || "símbolo"}
                className="max-h-28 w-auto rounded-md object-contain"
              />
            ) : emoji ? (
              <span className="text-5xl leading-none">{emoji}</span>
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
          {imageSrc && (
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
            onChange={(e) => onPickFile(e.target.files?.[0])}
          />
        </div>

        {/* emoji — fallback escondido */}
        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => setShowEmoji((s) => !s)}
            className="flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Smile className="size-3.5" />
            {showEmoji ? "Ocultar emojis" : "Sin imagen: usar un emoji"}
          </button>
          {showEmoji && (
            <div className="flex flex-wrap gap-1.5">
              {SYMBOL_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => onPickEmoji(e)}
                  className={cn(
                    "grid size-9 place-items-center rounded-sm border text-lg leading-none transition-colors hover:bg-accent",
                    emoji === e ? "border-ring ring-[3px] ring-ring/15" : "border-border"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* nombre */}
        <div className="grid gap-2">
          <Label htmlFor="symbol-name">
            Nombre <span className="text-destructive">*</span>
          </Label>
          <Input
            id="symbol-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Seven"
          />
        </div>

        {/* peso */}
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <Label>Peso</Label>
            <span className="text-sm font-semibold tabular-nums">{weight}</span>
          </div>
          <div className="flex items-center gap-4">
            <Slider
              value={[weight]}
              min={MIN_SYMBOL_WEIGHT}
              max={MAX_SYMBOL_WEIGHT}
              step={1}
              onValueChange={([v]) => setWeight(clamp(v))}
              className="flex-1"
            />
            <div className="flex items-center rounded-md border">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-r-none"
                onClick={() => setWeight((v) => clamp(v - 1))}
              >
                <Minus />
              </Button>
              <span className="w-10 text-center text-base font-semibold tabular-nums">
                {weight}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-l-none"
                onClick={() => setWeight((v) => clamp(v + 1))}
              >
                <Plus />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            A mayor peso, más seguido aparece. Peso 0 = nunca aparece.
          </p>
        </div>

        <DialogFooter className="sm:justify-end">
          {editing && (
            <Button
              variant="ghost"
              className="mr-auto text-destructive hover:text-destructive"
              onClick={remove}
              disabled={pending}
            >
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={!canSave}>
            <Check className="size-4" />
            {pending ? "Guardando…" : "Guardar símbolo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
