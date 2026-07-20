"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"

import type {
  Banner,
  BannerBarRef,
  BannerComputedStatus,
  BannerFormValues,
  BannerScope,
} from "@/lib/banners/types"
import { SCOPE_FILTERS, STATUS_FILTERS, PAGE_SIZE } from "@/config/banners"
import { computeBannerStatus, bannerScope } from "@/lib/banners/status"
import {
  createBanner,
  deleteBanner,
  replaceBannerImage,
  reorderBanners,
  toggleBanner,
  updateBanner,
} from "@/lib/banners/actions"
import { withToast } from "@/lib/run-action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { BannersKpis } from "@/components/banners/banners-kpis"
import { BannersTable, type OrderInfo } from "@/components/banners/banners-table"
import { BarSelect } from "@/components/banners/bar-select"
import { BannerFormDialog } from "@/components/banners/dialogs/banner-form-dialog"
import { ReplaceImageDialog } from "@/components/banners/dialogs/replace-image-dialog"
import { DeleteBannerDialog } from "@/components/banners/dialogs/delete-banner-dialog"

export type BannerDialogKind = "create" | "edit" | "replace-image" | "delete"
type DialogState = { kind: BannerDialogKind | null; banner: Banner | null }

const scopeKey = (b: Banner) => b.barId ?? "global"

// Multipart del alta. isActive no viaja (el backend lo resuelve por defecto y el
// action togglea si se pidió inactivo — @Type(Boolean) no distingue "false").
function bannerFormData(values: BannerFormValues, file: File): FormData {
  const fd = new FormData()
  fd.append("file", file)
  fd.append("title", values.title)
  if (values.description) fd.append("description", values.description)
  if (values.barId) fd.append("barId", values.barId)
  if (values.linkUrl) fd.append("linkUrl", values.linkUrl)
  fd.append("displayOrder", String(values.displayOrder))
  if (values.startsAt) fd.append("startsAt", values.startsAt)
  if (values.endsAt) fd.append("endsAt", values.endsAt)
  return fd
}

/**
 * Orquesta el módulo Banners: filtros (alcance, estado, búsqueda), paginación
 * client-side, reordenamiento por displayOrder y los diálogos. Prop-driven: las
 * mutaciones pegan a los server actions y `revalidatePath` refresca la lista.
 */
export function BannersManager({
  banners,
  bars,
}: {
  banners: Banner[]
  bars: BannerBarRef[]
}) {
  const [query, setQuery] = useState("")
  const [scope, setScope] = useState<BannerScope | "all">("all")
  const [barId, setBarId] = useState<string>("") // "" = todos (dentro de scope local)
  const [status, setStatus] = useState<BannerComputedStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [dialog, setDialog] = useState<DialogState>({ kind: null, banner: null })
  const [, startTransition] = useTransition()

  /* ---------- filtrado + orden ---------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return banners
      .filter((b) => {
        const sc = bannerScope(b)
        if (scope !== "all" && sc !== scope) return false
        if (scope === "local" && barId && b.barId !== barId) return false
        if (status !== "all" && computeBannerStatus(b) !== status) return false
        if (q) {
          const hay =
            b.title.toLowerCase().includes(q) ||
            (b.description?.toLowerCase().includes(q) ?? false) ||
            (b.bar?.name.toLowerCase().includes(q) ?? false)
          if (!hay) return false
        }
        return true
      })
      .sort((a, b) => {
        const ak = scopeKey(a)
        const bk = scopeKey(b)
        if (ak !== bk) {
          if (ak === "global") return -1
          if (bk === "global") return 1
          return (a.bar?.name ?? "").localeCompare(b.bar?.name ?? "")
        }
        return a.displayOrder - b.displayOrder
      })
  }, [banners, query, scope, barId, status])

  // Al cambiar filtros/búsqueda volvemos a la primera página.
  useEffect(() => {
    setPage(1)
  }, [query, scope, barId, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  /* ---------- info de reordenamiento (dentro de cada carrusel) ---------- */
  const orderInfo = useMemo(() => {
    const groups = new Map<string, Banner[]>()
    for (const b of banners) {
      const k = scopeKey(b)
      if (!groups.has(k)) groups.set(k, [])
      groups.get(k)!.push(b)
    }
    const info: Record<string, OrderInfo> = {}
    for (const list of groups.values()) {
      const sorted = [...list].sort((a, b) => a.displayOrder - b.displayOrder)
      sorted.forEach((b, i) => {
        info[b.id] = { canUp: i > 0, canDown: i < sorted.length - 1 }
      })
    }
    return info
  }, [banners])

  const open = (kind: BannerDialogKind, banner: Banner | null) =>
    setDialog({ kind, banner })
  const close = () => setDialog({ kind: null, banner: null })
  const resetFilters = () => {
    setScope("all")
    setBarId("")
    setStatus("all")
    setQuery("")
  }

  /* ---------- mutaciones directas (toggle / reordenar) ---------- */
  const handleToggle = (banner: Banner) =>
    startTransition(() => {
      void withToast(() => toggleBanner(banner.id), "Estado actualizado")
    })

  const handleMove = (banner: Banner, dir: "up" | "down") => {
    const group = banners
      .filter((b) => scopeKey(b) === scopeKey(banner))
      .sort((a, b) => a.displayOrder - b.displayOrder)
    const idx = group.findIndex((b) => b.id === banner.id)
    const neighbor = group[dir === "up" ? idx - 1 : idx + 1]
    if (!neighbor) return
    startTransition(() => {
      void withToast(
        () =>
          reorderBanners([
            { id: banner.id, displayOrder: neighbor.displayOrder },
            { id: neighbor.id, displayOrder: banner.displayOrder },
          ]),
        "Orden actualizado"
      )
    })
  }

  /* ---------- mutaciones vía diálogo (tiran el error para verlo inline) ---------- */
  const handleCreate = async (values: BannerFormValues, file: File) => {
    await createBanner(bannerFormData(values, file), !values.isActive)
    toast.success("Banner creado")
  }
  const handleUpdate = async (id: string, values: BannerFormValues) => {
    await updateBanner(id, values)
    toast.success("Banner actualizado")
  }
  const handleReplaceImage = async (id: string, file: File) => {
    const fd = new FormData()
    fd.append("file", file)
    await replaceBannerImage(id, fd)
    toast.success("Imagen reemplazada")
  }
  const handleDelete = async (id: string) => {
    await deleteBanner(id)
    toast.success("Banner eliminado")
  }

  const nextOrderForScope = (bId: string | null) =>
    banners
      .filter((b) => (b.barId ?? "global") === (bId ?? "global"))
      .reduce((max, b) => Math.max(max, b.displayOrder + 1), 0)

  const activeFilters =
    scope !== "all" || status !== "all" || query.trim() !== "" || barId !== ""

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Banners</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona el carrusel promocional: banners globales y por bar, su vigencia y su orden.
          </p>
        </div>
        <Button className="ml-auto" onClick={() => open("create", null)}>
          <Plus />
          Nuevo banner
        </Button>
      </div>

      <BannersKpis banners={banners} />

      <Card className="py-0">
        <CardHeader className="gap-1 border-b py-5">
          <CardTitle>Listado de banners</CardTitle>
          <CardDescription>
            El estado combina el toggle con la ventana de fechas; sólo los “Activos” aparecen en el carrusel público.
          </CardDescription>
        </CardHeader>

        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 border-b px-6 py-3.5">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, descripción o bar…"
              className="pl-8"
            />
          </div>

          {scope === "local" && (
            <BarSelect
              value={barId}
              onChange={(v) => setBarId(v ?? "")}
              bars={bars}
              allowAll
              allowGlobal={false}
              className="w-56"
            />
          )}

          <div className="ml-auto flex flex-wrap items-center gap-2.5">
            <ToggleGroup
              type="single"
              value={scope}
              onValueChange={(v) => {
                if (!v) return
                setScope(v as BannerScope | "all")
                setBarId("")
              }}
              variant="outline"
              size="sm"
            >
              {SCOPE_FILTERS.map((f) => (
                <ToggleGroupItem key={f.value} value={f.value}>
                  {f.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <ToggleGroup
              type="single"
              value={status}
              onValueChange={(v) => v && setStatus(v as BannerComputedStatus | "all")}
              variant="outline"
              size="sm"
            >
              {STATUS_FILTERS.map((f) => (
                <ToggleGroupItem key={f.value} value={f.value}>
                  {f.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        {activeFilters && (
          <div className="flex items-center gap-2 border-b px-6 py-2 text-xs text-muted-foreground">
            <span>
              {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
            </span>
            <button
              className="underline underline-offset-2 hover:text-foreground"
              onClick={resetFilters}
            >
              Limpiar filtros
            </button>
          </div>
        )}

        <CardContent className="px-0 pb-0">
          <BannersTable
            banners={pageItems}
            orderInfo={orderInfo}
            onAction={open}
            onToggle={handleToggle}
            onMove={handleMove}
          />
        </CardContent>

        {/* paginación */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t px-6 py-3.5 text-sm">
            <span className="text-muted-foreground">
              Página {safePage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* diálogos */}
      <BannerFormDialog
        open={dialog.kind === "create" || dialog.kind === "edit"}
        banner={dialog.kind === "edit" ? dialog.banner : null}
        bars={bars}
        defaultOrder={nextOrderForScope}
        onClose={close}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
      <ReplaceImageDialog
        open={dialog.kind === "replace-image"}
        banner={dialog.banner}
        onClose={close}
        onReplace={handleReplaceImage}
      />
      <DeleteBannerDialog
        open={dialog.kind === "delete"}
        banner={dialog.banner}
        onClose={close}
        onDelete={handleDelete}
      />
    </div>
  )
}
