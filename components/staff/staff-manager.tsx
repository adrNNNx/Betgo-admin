"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { UserPlus, Search } from "lucide-react"

import type { BarRef, StaffMember, StaffRole, StaffStatus } from "@/lib/staff/types"
import { DEFAULT_STAFF_QUERY } from "@/lib/staff/types"
import { fetchStaff } from "@/lib/staff/actions"
import { ROLE_FILTERS, STAFF_PAGE_SIZE, STATUS_FILTERS } from "@/config/staff"
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
import { StaffBalanceDialog } from "@/components/staff/dialogs/staff-balance-dialog"

export type StaffDialogKind = "create" | "edit" | "suspend" | "balance"

type DialogState = { kind: StaffDialogKind | null; member: StaffMember | null }

/**
 * Orquesta el listado de personal. Búsqueda, filtros y paginación se resuelven
 * en el backend, así la búsqueda encuentra en todo el staff (no solo en la
 * página cargada) y el listado escala sin techo de registros.
 */
export function StaffManager({
  initialData,
  initialTotal,
  bars,
}: {
  initialData: StaffMember[]
  initialTotal: number
  bars: BarRef[]
}) {
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [bar, setBar] = useState<string>("all")
  const [role, setRole] = useState<StaffRole | "all">("all")
  const [status, setStatus] = useState<StaffStatus | "all">("all")
  const [page, setPage] = useState(0)
  const [data, setData] = useState(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [dialog, setDialog] = useState<DialogState>({ kind: null, member: null })
  // Se incrementa tras un alta/edición/cambio de estado para recargar la lista.
  const [refresh, setRefresh] = useState(0)
  const [pending, startTransition] = useTransition()
  const firstRender = useRef(true)

  // Debounce de la búsqueda → vuelve a la primera página.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(0)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  // Carga la página cuando cambian filtros/página, o tras una mutación.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    startTransition(async () => {
      const res = await fetchStaff(
        { ...DEFAULT_STAFF_QUERY, search, barId: bar, role, status },
        page * STAFF_PAGE_SIZE,
        STAFF_PAGE_SIZE
      )
      setData(res.data)
      setTotal(res.total)
    })
  }, [search, bar, role, status, page, refresh])

  const onChanged = () => setRefresh((k) => k + 1)
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre o identificador…"
              className="pl-8"
            />
          </div>

          <Select
            value={bar}
            onValueChange={(v) => {
              setBar(v)
              setPage(0)
            }}
          >
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

          <Select
            value={role}
            onValueChange={(v) => {
              setRole(v as StaffRole | "all")
              setPage(0)
            }}
          >
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
            onValueChange={(v) => {
              if (!v) return
              setStatus(v as StaffStatus | "all")
              setPage(0)
            }}
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
            {total} {total === 1 ? "miembro" : "miembros"}
          </span>
        </div>

        <CardContent className="px-0 pb-0">
          <StaffTable
            staff={data}
            total={total}
            page={page}
            pending={pending}
            onPage={setPage}
            onAction={open}
            onChanged={onChanged}
          />
        </CardContent>
      </Card>

      {/* diálogos */}
      <StaffFormDialog
        open={dialog.kind === "create" || dialog.kind === "edit"}
        member={dialog.kind === "edit" ? dialog.member : null}
        bars={bars}
        onClose={close}
        onChanged={onChanged}
      />
      <SuspendStaffDialog
        open={dialog.kind === "suspend"}
        member={dialog.member}
        onClose={close}
        onChanged={onChanged}
      />
      <StaffBalanceDialog
        open={dialog.kind === "balance"}
        member={dialog.member}
        onClose={close}
        onChanged={onChanged}
      />
    </>
  )
}
