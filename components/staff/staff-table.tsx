"use client"

import { ChevronLeft, ChevronRight, Store } from "lucide-react"

import type { StaffMember } from "@/lib/staff/types"
import type { StaffDialogKind } from "@/components/staff/staff-manager"
import { STAFF_PAGE_SIZE } from "@/config/staff"
import { initials, avatarColor } from "@/lib/staff/identifier"
import { identifierKind, IDENTIFIER_META } from "@/lib/staff/identifier"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StaffStatusBadge } from "@/components/staff/staff-status-badge"
import { StaffRoleCell } from "@/components/staff/staff-role-cell"
import { StaffIdentifier } from "@/components/staff/staff-identifier"
import { StaffRowActions } from "@/components/staff/staff-row-actions"

export function StaffTable({
  staff,
  total,
  page,
  pending,
  onPage,
  onAction,
  onChanged,
}: {
  /** Miembros de la página actual. */
  staff: StaffMember[]
  /** Total tras aplicar búsqueda y filtros (server-side). */
  total: number
  page: number
  pending: boolean
  onPage: (page: number) => void
  onAction: (kind: StaffDialogKind, member: StaffMember) => void
  onChanged: () => void
}) {
  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-1 px-6 py-16 text-center">
        <p className="text-sm font-medium">No se encontraron miembros</p>
        <p className="text-sm text-muted-foreground">
          Probá con otra búsqueda o ajustá los filtros.
        </p>
      </div>
    )
  }

  const pageCount = Math.max(1, Math.ceil(total / STAFF_PAGE_SIZE))
  const from = page * STAFF_PAGE_SIZE + 1
  const to = Math.min(total, (page + 1) * STAFF_PAGE_SIZE)

  return (
    <>
      <div
        className={cn(
          "max-h-[560px] overflow-auto transition-opacity",
          pending && "pointer-events-none opacity-60"
        )}
        aria-busy={pending}
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow className="hover:bg-transparent">
              <TableHead>Miembro</TableHead>
              <TableHead>Identificador</TableHead>
              <TableHead>Bar asignado</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
        {staff.map((member) => {
          const kindLabel = IDENTIFIER_META[identifierKind(member.identifier)].label
          return (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: avatarColor(member.name) }}
                    aria-hidden
                  >
                    {initials(member.name)}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{kindLabel}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StaffIdentifier value={member.identifier} />
              </TableCell>
              <TableCell>
                {member.barName ? (
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <Store className="size-3.5 text-muted-foreground" />
                    {member.barName}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Sin asignar</span>
                )}
              </TableCell>
              <TableCell>
                <StaffRoleCell role={member.role} />
              </TableCell>
              <TableCell>
                <StaffStatusBadge status={member.status} />
              </TableCell>
              <TableCell className="text-right">
                <StaffRowActions
                  member={member}
                  onAction={onAction}
                  onChanged={onChanged}
                />
              </TableCell>
            </TableRow>
          )
            })}
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
