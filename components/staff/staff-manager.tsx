"use client"

import { useMemo, useState } from "react"
import { UserPlus, Search } from "lucide-react"

import type { BarRef, StaffMember, StaffRole, StaffStatus } from "@/lib/staff/types"
import { ROLE_FILTERS, STATUS_FILTERS } from "@/config/staff"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { StaffTable } from "@/components/staff/staff-table"
import { StaffFormDialog } from "@/components/staff/dialogs/staff-form-dialog"
import { SuspendStaffDialog } from "@/components/staff/dialogs/suspend-staff-dialog"

export type StaffDialogKind = "create" | "edit" | "suspend"

type DialogState = { kind: StaffDialogKind | null; member: StaffMember | null }

/**
 * Orquesta el listado de personal: búsqueda, filtros (bar / rol / estado) y el
 * estado de los diálogos. Un solo punto de control hace el módulo escalable.
 */
export function StaffManager({
  staff,
  bars,
}: {
  staff: StaffMember[]
  bars: BarRef[]
}) {
  const [query, setQuery] = useState("")
  const [bar, setBar] = useState<string>("all")
  const [role, setRole] = useState<StaffRole | "all">("all")
  const [status, setStatus] = useState<StaffStatus | "all">("all")
  const [dialog, setDialog] = useState<DialogState>({ kind: null, member: null })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return staff.filter((s) => {
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.identifier.toLowerCase().includes(q)
      const matchesBar = bar === "all" || s.barId === bar
      const matchesRole = role === "all" || s.role === role
      const matchesStatus = status === "all" || s.status === status
      return matchesQuery && matchesBar && matchesRole && matchesStatus
    })
  }, [staff, query, bar, role, status])

  const open = (kind: StaffDialogKind, member: StaffMember) =>
    setDialog({ kind, member })
  const close = () => setDialog({ kind: null, member: null })

  return (
    <>
      <div className="flex items-start gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Mozos y encargados
          </h1>
          <p className="max-w-prose text-sm text-muted-foreground">
            Gestiona el personal de cada bar y controla su acceso al panel del
            mozo y encargado.
          </p>
        </div>
        <Button
          className="ml-auto"
          onClick={() => setDialog({ kind: "create", member: null })}
        >
          <UserPlus />
          Nuevo staff
        </Button>
      </div>

      <Card className="py-0">
        <CardHeader className="gap-1 border-b py-5">
          <CardTitle>Listado de mozos y encargados</CardTitle>
          <CardDescription>
            Visualiza el personal habilitado y gestiona rápidamente su estado
            operativo.
          </CardDescription>
        </CardHeader>

        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 border-b px-6 py-3.5">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o identificador…"
              className="pl-8"
            />
          </div>

          <Select value={bar} onValueChange={setBar}>
            <SelectTrigger size="sm" className="w-[170px]">
              <SelectValue placeholder="Todos los bares" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los bares</SelectItem>
              {bars.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={role} onValueChange={(v) => setRole(v as StaffRole | "all")}>
            <SelectTrigger size="sm" className="w-[160px]">
              <SelectValue placeholder="Todos los roles" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ToggleGroup
            type="single"
            value={status}
            onValueChange={(v) => v && setStatus(v as StaffStatus | "all")}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            {STATUS_FILTERS.map((f) => (
              <ToggleGroupItem key={f.value} value={f.value}>
                {f.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "miembro" : "miembros"}
          </span>
        </div>

        <CardContent className="px-0 pb-0">
          <StaffTable staff={filtered} onAction={open} />
        </CardContent>
      </Card>

      {/* diálogos */}
      <StaffFormDialog
        open={dialog.kind === "create" || dialog.kind === "edit"}
        member={dialog.kind === "edit" ? dialog.member : null}
        bars={bars}
        onClose={close}
      />
      <SuspendStaffDialog
        open={dialog.kind === "suspend"}
        member={dialog.member}
        onClose={close}
      />
    </>
  )
}
