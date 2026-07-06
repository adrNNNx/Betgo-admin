"use client"

import { Store } from "lucide-react"

import type { StaffMember } from "@/lib/staff/types"
import type { StaffDialogKind } from "@/components/staff/staff-manager"
import { initials, avatarColor } from "@/lib/staff/identifier"
import { identifierKind, IDENTIFIER_META } from "@/lib/staff/identifier"
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
  onAction,
}: {
  staff: StaffMember[]
  onAction: (kind: StaffDialogKind, member: StaffMember) => void
}) {
  if (staff.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 px-6 py-16 text-center">
        <p className="text-sm font-medium">No se encontraron miembros</p>
        <p className="text-sm text-muted-foreground">
          Probá con otra búsqueda o ajustá los filtros.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
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
                <StaffRowActions member={member} onAction={onAction} />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
