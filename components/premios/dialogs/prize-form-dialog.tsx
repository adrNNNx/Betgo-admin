"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { Gift, Trophy, UploadCloud } from "lucide-react"

import type { Prize, Scope } from "@/lib/premios/types"
import { IMAGE_ACCEPT, MAX_IMAGE_MB } from "@/config/premios"
import { isImageSrc } from "@/lib/premios/helpers"
import { createPrize, updatePrize } from "@/lib/premios/actions"
import { withToast } from "@/lib/run-action"
import { formatGs } from "@/lib/format"
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
import { NumberInput } from "@/components/ui/number-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { TipoBadge } from "@/components/premios/prize-badges"

/**
 * Alta / edición de un premio. El tipo (local / jackpot) lo determina el ámbito
 * (bar → local, pozo → jackpot), no se elige a mano. La imagen es opcional.
 */
export function PrizeFormDialog({
  open,
  scope,
  prize,
  onClose,
}: {
  open: boolean
  scope: Scope
  prize: Prize | null
  onClose: () => void
}) {
  const editing = Boolean(prize)
  const isJackpot = scope.type === "global"
  const [name, setName] = useState("")
  const [value, setValue] = useState<number | null>(null)
  const [unlimited, setUnlimited] = useState(true)
  const [stock, setStock] = useState<number | null>(null)
  const [desc, setDesc] = useState("")
  const [status, setStatus] = useState<"active" | "inactive">("active")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    setName(prize?.name ?? "")
    setValue(prize?.value ?? null)
    setUnlimited(prize ? prize.stock === null : true)
    setStock(prize?.stock ?? null)
    setDesc(prize?.desc ?? "")
    setStatus(prize?.status ?? "active")
    setFile(null)
    setPreview(null)
    setError(null)
  }, [open, prize])

  const onPickFile = (f: File | undefined) => {
    if (!f) return
    if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`La imagen supera los ${MAX_IMAGE_MB}MB.`)
      return
    }
    setError(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const imageSrc =
    preview ?? (prize?.imageUrl && isImageSrc(prize.imageUrl) ? prize.imageUrl : null)
  const valueNum = value ?? 0
  const valid = name.trim().length > 0

  const submit = () => {
    const fd = new FormData()
    fd.append("name", name.trim())
    fd.append("value", value === null ? "" : String(value))
    fd.append("unlimited", String(unlimited))
    fd.append("stock", unlimited || stock === null ? "" : String(stock))
    fd.append("description", desc.trim())
    fd.append("status", status)
    if (file) fd.append("file", file)

    startTransition(async () => {
      const ok = await withToast(
        () => (prize ? updatePrize(prize.id, fd) : createPrize(scope.barId, fd)),
        editing ? "Premio actualizado" : "Premio creado"
      )
      if (ok) onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar premio" : "Registrar premio"}</DialogTitle>
          <DialogDescription>
            {editing ? "Actualiza los datos de este premio en " : "Define el premio para "}
            <strong>{scope.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* preview */}
        <div className="flex items-center gap-3 rounded-lg border bg-secondary/40 p-3">
          <span className="grid size-11 flex-none place-items-center overflow-hidden rounded-md bg-background">
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageSrc} alt="" className="size-full object-cover" />
            ) : isJackpot ? (
              <Trophy className="size-5 text-amber-500" />
            ) : (
              <Gift className="size-5 text-muted-foreground" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{name.trim() || "Nombre del premio"}</div>
            <div className="mt-0.5 flex items-center gap-2">
              <TipoBadge type={isJackpot ? "jackpot" : "local"} />
              <span className="text-xs text-muted-foreground">
                {valueNum ? formatGs(valueNum) : "Sin valor"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="pz-name">Nombre</Label>
          <Input
            id="pz-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Chop Pilsen 500ml"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="pz-value">
            Valor estimado{" "}
            <span className="font-normal text-muted-foreground">(opcional, Gs)</span>
          </Label>
          <NumberInput
            id="pz-value"
            value={value}
            onValueChange={setValue}
            placeholder="0"
            className="tabular-nums"
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Stock ilimitado</Label>
              <p className="text-xs text-muted-foreground">
                Sin control de existencias (ej. tragos de la casa).
              </p>
            </div>
            <Switch checked={unlimited} onCheckedChange={setUnlimited} />
          </div>
          {!unlimited && (
            <NumberInput
              value={stock}
              onValueChange={setStock}
              placeholder="Cantidad en stock"
              className="tabular-nums"
            />
          )}
        </div>

        {/* imagen (opcional) */}
        <div className="grid gap-2">
          <Label>
            Imagen <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              onPickFile(e.dataTransfer.files?.[0])
            }}
            className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-lg border border-dashed bg-secondary p-3 text-center text-muted-foreground transition-colors hover:border-ring"
          >
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageSrc} alt="" className="max-h-24 w-auto rounded-md object-contain" />
            ) : (
              <>
                <UploadCloud className="size-5" />
                <p className="text-xs">Arrastra o haz clic · máx. {MAX_IMAGE_MB}MB</p>
              </>
            )}
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="hidden"
            onChange={(e) => onPickFile(e.target.files?.[0])}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="pz-desc">
            Descripción <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Textarea
            id="pz-desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Condiciones o instrucciones para canjear."
          />
        </div>

        <div className="grid gap-2">
          <Label>Estado</Label>
          <ToggleGroup
            type="single"
            value={status}
            onValueChange={(v) => v && setStatus(v as "active" | "inactive")}
            variant="outline"
            size="sm"
            className="w-full *:flex-1"
          >
            <ToggleGroupItem value="active">Activo</ToggleGroupItem>
            <ToggleGroupItem value="inactive">Inactivo</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!valid || pending}>
            {editing ? "Guardar cambios" : "Guardar premio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
