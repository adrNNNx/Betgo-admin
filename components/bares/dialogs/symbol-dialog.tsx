"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { Minus, Plus, Smile, UploadCloud } from "lucide-react"

import type { Bar, BarSymbol } from "@/lib/bares/types"
import {
  IMAGE_ACCEPT,
  MAX_IMAGE_MB,
  SYMBOL_EMOJIS,
  SYMBOL_WEIGHT_MAX,
} from "@/config/bares"
import { saveSymbol } from "@/lib/bares/actions"
import { isImageSrc } from "@/lib/bares/symbols"
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
 * Alta / edición de un símbolo. La imagen propia es lo principal (dropzone →
 * Cloudinary). El emoji queda como *fallback* escondido detrás de un botón,
 * para los casos donde no se quiere subir una imagen. Los premios se asignan
 * desde el módulo de premios, no acá.
 */
export function SymbolDialog({
  open,
  bar,
  symbol,
  onClose,
}: {
  open: boolean
  bar: Bar | null
  symbol: BarSymbol | null
  onClose: () => void
}) {
  const editing = Boolean(symbol)
  const [name, setName] = useState("")
  const [weight, setWeight] = useState(10)
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
    setWeight(symbol?.weight ?? 10)
    setFile(null)
    setPreview(null)
    // Si el símbolo actual es un emoji (no una URL), lo precargamos como fallback.
    const isEmoji = symbol ? !isImageSrc(symbol.emoji) : false
    setEmoji(isEmoji ? symbol!.emoji : null)
    setShowEmoji(isEmoji)
    setError(null)
  }, [open, symbol])

  if (!bar) return null

  const clamp = (n: number) => Math.max(1, Math.min(SYMBOL_WEIGHT_MAX, n))

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

  // Imagen a mostrar: preview nueva, o la imagen actual del símbolo si es URL.
  const imageSrc =
    preview ?? (symbol && isImageSrc(symbol.emoji) ? symbol.emoji : null)

  // En alta hace falta imagen o emoji; en edición se mantiene lo actual.
  const valid =
    name.trim().length > 0 && (editing || file !== null || emoji !== null)

  const submit = () => {
    const fd = new FormData()
    if (symbol?.id) fd.append("id", symbol.id)
    fd.append("name", name.trim())
    fd.append("weight", String(weight))
    if (file) fd.append("file", file)
    else if (emoji) fd.append("emoji", emoji)
    startTransition(async () => {
      const ok = await withToast(
        () => saveSymbol(bar.id, fd),
        editing ? "Símbolo actualizado" : "Símbolo creado"
      )
      if (ok) onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar símbolo" : "Nuevo símbolo"} · {bar.name}
          </DialogTitle>
          <DialogDescription>
            Agrega o edita los símbolos para el bar seleccionado.
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
          <Label htmlFor="sym-name">Nombre</Label>
          <Input
            id="sym-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Trébol"
          />
        </div>

        {/* peso */}
        <div className="grid gap-3">
          <Label>Peso</Label>
          <div className="flex items-center gap-4">
            <Slider
              min={1}
              max={SYMBOL_WEIGHT_MAX}
              step={1}
              value={[weight]}
              onValueChange={([v]) => setWeight(v)}
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
            Cuanto mayor el peso, más seguido aparece el símbolo en los rodillos.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={pending || !valid}>
            {editing ? "Guardar cambios" : "Guardar símbolo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
