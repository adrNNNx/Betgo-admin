"use client"

import { useTransition } from "react"
import {
  MoreHorizontal,
  Pencil,
  Copy,
  CircleCheck,
  Pause,
  Ban,
  RotateCcw,
} from "lucide-react"

import type { StaffMember } from "@/lib/staff/types"
import type { StaffDialogKind } from "@/components/staff/staff-manager"
import { setStaffStatus } from "@/lib/staff/actions"
import { withToast } from "@/lib/run-action"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function StaffRowActions({
  member,
  onAction,
}: {
  member: StaffMember
  onAction: (kind: StaffDialogKind, member: StaffMember) => void
}) {
  const [pending, startTransition] = useTransition()
  const isActive = member.status === "active"
  const isInactive = member.status === "inactive"
  const isSuspended = member.status === "suspended"

  const change = (status: StaffMember["status"]) =>
    startTransition(() => {
      void withToast(() => setStaffStatus(member.id, status), "Estado actualizado")
    })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          disabled={pending}
        >
          <MoreHorizontal />
          <span className="sr-only">Acciones de {member.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Administrar</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onAction("edit", member)}>
          <Pencil />
          Editar datos
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigator.clipboard?.writeText(member.identifier)}
        >
          <Copy />
          Copiar identificador
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Acceso</DropdownMenuLabel>
        <DropdownMenuItem disabled={isActive} onClick={() => change("active")}>
          <CircleCheck />
          Marcar como activo
        </DropdownMenuItem>
        <DropdownMenuItem disabled={isInactive} onClick={() => change("inactive")}>
          <Pause />
          Pasar a inactivo
        </DropdownMenuItem>
        {isSuspended ? (
          <DropdownMenuItem onClick={() => onAction("suspend", member)}>
            <RotateCcw />
            Reactivar acceso
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onAction("suspend", member)}
          >
            <Ban />
            Suspender acceso
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
