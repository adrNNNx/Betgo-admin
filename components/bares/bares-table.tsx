"use client"

import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"

import type { Bar } from "@/lib/bares/types"
import type { BarDialogKind } from "@/components/bares/bares-manager"
import { BARS_PAGE_SIZE } from "@/config/bares"
import { formatNumber } from "@/lib/format"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DistributionBar } from "@/components/bares/distribution-bar"
import { BarStatusBadge } from "@/components/bares/bar-status-badge"
import { BarRowActions } from "@/components/bares/bar-row-actions"

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function BaresTable({
  bars,
  total,
  page,
  onPage,
  onAction,
}: {
  /** Bares de la página actual. */
  bars: Bar[]
  /** Total tras aplicar búsqueda y filtro. */
  total: number
  page: number
  onPage: (page: number) => void
  onAction: (kind: BarDialogKind, bar: Bar) => void
}) {
  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-1 px-6 py-16 text-center">
        <p className="text-sm font-medium">No se encontraron bares</p>
        <p className="text-sm text-muted-foreground">
          Probá con otra búsqueda o registrá un nuevo bar.
        </p>
      </div>
    )
  }

  const pageCount = Math.max(1, Math.ceil(total / BARS_PAGE_SIZE))
  const from = page * BARS_PAGE_SIZE + 1
  const to = Math.min(total, (page + 1) * BARS_PAGE_SIZE)

  return (
    <>
      <div className="max-h-[560px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow className="hover:bg-transparent">
              <TableHead>Bar</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Jugadas/día</TableHead>
              <TableHead>Distribución</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bars.map((bar) => (
              <TableRow key={bar.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary text-xs font-bold">
                  {bar.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bar.imageUrl} alt={bar.name} className="size-full object-cover" />
                  ) : (
                    initials(bar.name)
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold">{bar.name}</div>
                  {bar.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      {bar.location}
                    </div>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <code className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                {bar.slug}
              </code>
            </TableCell>
            <TableCell className="font-semibold tabular-nums">
              <span className="mr-1 text-xs font-medium text-muted-foreground">Gs.</span>
              {formatNumber(bar.balance)}
            </TableCell>
            <TableCell>
              <span className="inline-grid h-6 min-w-6 place-items-center rounded-sm bg-secondary px-1.5 text-sm font-semibold tabular-nums">
                {bar.freePlaysPerDay}
              </span>
            </TableCell>
            <TableCell>
              <DistributionBar value={bar.distribution} />
            </TableCell>
            <TableCell>
              <BarStatusBadge status={bar.status} />
            </TableCell>
            <TableCell className="text-right">
              <BarRowActions bar={bar} onAction={onAction} />
            </TableCell>
          </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* paginación */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-3.5">
        <span className="text-xs text-muted-foreground tabular-nums">
          Mostrando {from}–{to} de {total}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            Página {page + 1} de {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => onPage(Math.max(0, page - 1))}
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount - 1}
            onClick={() => onPage(page + 1)}
          >
            Siguiente
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </>
  )
}
