"use client"

import { useEffect, useRef, useState } from "react"
import { UploadCloud, Globe, Store, AlertCircle } from "lucide-react"

import type { Banner, BannerBarRef, BannerFormValues } from "@/lib/banners/types"
import { MAX_IMAGE_MB, IMAGE_ACCEPT } from "@/config/banners"
import {
  isoToDateInput,
  dateInputToStartIso,
  dateInputToEndIso,
  isValidWindow,
} from "@/lib/banners/status"
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
import { NumberInput } from "@/components/ui/number-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { BarSelect } from "@/components/banners/bar-select"

const TITLE_MAX = 100
const DESC_MAX = 1000

export function BannerFormDialog({
  open,
  banner,
  bars,
  defaultOrder,
  onClose,
  onCreate,
  onUpdate,
}: {
  open: boolean
  banner: Banner | null
  bars: BannerBarRef[]
  /** displayOrder sugerido para el próximo banner del alcance dado. */
  defaultOrder: (barId: string | null) => number
  onClose: () => void
  onCreate: (values: BannerFormValues, file: File) => Promise<void>
  onUpdate: (id: string, values: BannerFormValues) => Promise<void>
}) {
  const isEdit = Boolean(banner)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [barId, setBarId] = useState<string | null>(null)
  const [linkUrl, setLinkUrl] = useState("")
  const [displayOrder, setDisplayOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setFile(null)
    setPreview(null)
    if (banner) {
      setTitle(banner.title)
      setDescription(banner.description ?? "")
      setBarId(banner.barId)
      setLinkUrl(banner.linkUrl ?? "")
      setDisplayOrder(banner.displayOrder)
      setIsActive(banner.isActive)
      setStartsAt(isoToDateInput(banner.startsAt))
      setEndsAt(isoToDateInput(banner.endsAt))
    } else {
      setTitle("")
      setDescription("")
      setBarId(null)
      setLinkUrl("")
      setDisplayOrder(defaultOrder(null))
      setIsActive(true)
      setStartsAt("")
      setEndsAt("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, banner])

  const onScopeChange = (value: string | null) => {
    setBarId(value)
    // sugerí el orden del carrusel destino sólo al crear
    if (!isEdit) setDisplayOrder(defaultOrder(value))
  }

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

  const startsIso = dateInputToStartIso(startsAt)
  const endsIso = dateInputToEndIso(endsAt)
  const windowValid = isValidWindow(startsIso, endsIso)
  const titleValid = title.trim().length > 0 && title.length <= TITLE_MAX
  const descValid = description.length <= DESC_MAX
  const imageValid = isEdit || Boolean(file)
  const valid = titleValid && descValid && windowValid && imageValid

  const submit = async () => {
    if (!valid) return
    const values: BannerFormValues = {
      title: title.trim(),
      description: description.trim(),
      barId,
      linkUrl: linkUrl.trim(),
      displayOrder,
      isActive,
      startsAt: startsIso,
      endsAt: endsIso,
    }
    setPending(true)
    setError(null)
    try {
      if (isEdit && banner) await onUpdate(banner.id, values)
      else await onCreate(values, file!)
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar banner" : "Nuevo banner"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualizá los datos del banner. Para cambiar la imagen usá “Reemplazar imagen”."
              : "Subí la imagen y definí a qué carrusel pertenece y cuándo se muestra."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4 sm:grid-cols-2">
          {/* Imagen (solo alta) */}
          {!isEdit && (
            <div className="grid gap-2 sm:col-span-2">
              <Label>
                Imagen <span className="text-destructive">*</span>
              </Label>
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
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="preview" className="max-h-32 w-auto rounded-md object-contain" />
                ) : (
                  <>
                    <UploadCloud className="size-6" />
                    <p className="text-sm font-medium text-foreground">
                      Arrastrá una imagen o hacé clic para subir
                    </p>
                    <p className="text-[11px]">JPG, PNG, WEBP o GIF · máx. {MAX_IMAGE_MB}MB</p>
                  </>
                )}
              </div>
              {preview && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-left text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  Cambiar imagen…
                </button>
              )}
              <input
                ref={inputRef}
                type="file"
                accept={IMAGE_ACCEPT}
                className="hidden"
                onChange={(e) => onPick(e.target.files?.[0])}
              />
            </div>
          )}

          {/* Título */}
          <div className="grid gap-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="banner-title">Título</Label>
              <span
                className={cn(
                  "text-xs tabular-nums text-muted-foreground",
                  title.length > TITLE_MAX && "text-destructive"
                )}
              >
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <Input
              id="banner-title"
              value={title}
              maxLength={TITLE_MAX + 10}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Jugadas gratis todos los viernes"
            />
          </div>

          {/* Descripción */}
          <div className="grid gap-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="banner-desc">Descripción</Label>
              <span
                className={cn(
                  "text-xs tabular-nums text-muted-foreground",
                  description.length > DESC_MAX && "text-destructive"
                )}
              >
                {description.length}/{DESC_MAX}
              </span>
            </div>
            <Textarea
              id="banner-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Texto opcional que acompaña al banner."
              rows={3}
            />
          </div>

          {/* Alcance */}
          <div className="grid gap-2">
            <Label htmlFor="banner-scope">Alcance</Label>
            <BarSelect id="banner-scope" value={barId} onChange={onScopeChange} bars={bars} />
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {barId ? <Store className="size-3" /> : <Globe className="size-3" />}
              {barId ? "Sólo visible en ese bar." : "Visible en todos los bares."}
            </p>
          </div>

          {/* Orden */}
          <div className="grid gap-2">
            <Label htmlFor="banner-order">Orden en el carrusel</Label>
            <NumberInput
              id="banner-order"
              value={displayOrder}
              onValueChange={(v) => setDisplayOrder(v ?? 0)}
            />
            <p className="text-xs text-muted-foreground">Menor número = aparece primero.</p>
          </div>

          {/* Link */}
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="banner-link">Enlace (opcional)</Label>
            <Input
              id="banner-link"
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>

          {/* Fechas (por día; vacío = sin programación) */}
          <div className="grid gap-2">
            <Label htmlFor="banner-starts">
              Desde <span className="font-normal text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="banner-starts"
              type="date"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="banner-ends">
              Hasta <span className="font-normal text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="banner-ends"
              type="date"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-2">
            Sin fechas, el banner se muestra siempre (mientras esté activo). Con
            fechas, se muestra desde el inicio del día “Desde” hasta el fin del día “Hasta”.
          </p>

          {!windowValid && (
            <p className="flex items-center gap-1.5 text-xs text-destructive sm:col-span-2">
              <AlertCircle className="size-3.5" />
              La fecha de inicio debe ser anterior a la de fin.
            </p>
          )}

          {/* Activo */}
          <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
            <div className="space-y-0.5">
              <Label htmlFor="banner-active">Activo</Label>
              <p className="text-xs text-muted-foreground">
                Si está apagado, no se muestra aunque esté dentro de la ventana de fechas.
              </p>
            </div>
            <Switch id="banner-active" checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <AlertCircle className="size-4" />
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!valid || pending}>
            {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear banner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
