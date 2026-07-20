"use client"

import { ExternalLink } from "lucide-react"

import type { Banner } from "@/lib/banners/types"
import type { BannerDialogKind } from "@/components/banners/banners-manager"
import { computeBannerStatus, formatDate } from "@/lib/banners/status"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { BannerScopeBadge } from "@/components/banners/banner-scope-badge"
import { BannerStatusBadge } from "@/components/banners/banner-status-badge"
import { BannerOrderControls } from "@/components/banners/banner-order-controls"
import { BannerRowActions } from "@/components/banners/banner-row-actions"

export type OrderInfo = { canUp: boolean; canDown: boolean }

export function BannersTable({
  banners,
  orderInfo,
  onAction,
  onToggle,
  onMove,
}: {
  banners: Banner[]
  orderInfo: Record<string, OrderInfo>
  onAction: (kind: BannerDialogKind, banner: Banner) => void
  onToggle: (banner: Banner) => void
  onMove: (banner: Banner, dir: "up" | "down") => void
}) {
  if (banners.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 px-6 py-16 text-center">
        <p className="text-sm font-medium">No se encontraron banners</p>
        <p className="text-sm text-muted-foreground">
          Probá con otros filtros o creá un nuevo banner.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[110px]">Preview</TableHead>
          <TableHead>Banner</TableHead>
          <TableHead>Alcance</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Orden</TableHead>
          <TableHead>Vigencia</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {banners.map((banner) => {
          const status = computeBannerStatus(banner)
          const info = orderInfo[banner.id] ?? { canUp: false, canDown: false }
          return (
            <TableRow key={banner.id}>
              <TableCell>
                <div className="flex h-12 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                </div>
              </TableCell>

              <TableCell className="max-w-[280px]">
                <div className="min-w-0 space-y-0.5">
                  <div className="truncate font-semibold">{banner.title}</div>
                  {banner.description && (
                    <div className="truncate text-xs text-muted-foreground">
                      {banner.description}
                    </div>
                  )}
                  {banner.linkUrl && (
                    <a
                      href={banner.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-1 truncate text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    >
                      <ExternalLink className="size-3 shrink-0" />
                      <span className="truncate">{banner.linkUrl}</span>
                    </a>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <BannerScopeBadge banner={banner} />
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Switch
                    checked={banner.isActive}
                    onCheckedChange={() => onToggle(banner)}
                    aria-label={banner.isActive ? "Desactivar banner" : "Activar banner"}
                  />
                  <BannerStatusBadge status={status} />
                </div>
              </TableCell>

              <TableCell>
                <BannerOrderControls
                  order={banner.displayOrder}
                  canMoveUp={info.canUp}
                  canMoveDown={info.canDown}
                  onMoveUp={() => onMove(banner, "up")}
                  onMoveDown={() => onMove(banner, "down")}
                />
              </TableCell>

              <TableCell className="text-xs">
                <div className="flex flex-col gap-0.5 tabular-nums text-muted-foreground">
                  <span>
                    <span className="text-foreground/60">Desde</span> {formatDate(banner.startsAt)}
                  </span>
                  <span>
                    <span className="text-foreground/60">Hasta</span> {formatDate(banner.endsAt)}
                  </span>
                </div>
              </TableCell>

              <TableCell className="text-right">
                <BannerRowActions banner={banner} onAction={onAction} onToggle={onToggle} />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
