"use client"

import { useMemo, useState, useTransition } from "react"
import { Plus, Search } from "lucide-react"

import type { Bar, BarStatus } from "@/lib/bares/types"
import { STATUS_FILTERS } from "@/config/bares"
import { setBarActive } from "@/lib/bares/actions"
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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { BaresTable } from "@/components/bares/bares-table"
import { BarFormDialog } from "@/components/bares/dialogs/bar-form-dialog"
import { RechargeDialog } from "@/components/bares/dialogs/recharge-dialog"
import { FreePlaysDialog } from "@/components/bares/dialogs/free-plays-dialog"
import { BarImageDialog } from "@/components/bares/dialogs/bar-image-dialog"
import { DeactivateBarDialog } from "@/components/bares/dialogs/deactivate-bar-dialog"

export type BarDialogKind =
  | "create"
  | "edit"
  | "recharge"
  | "freeplays"
  | "image"
  | "deactivate"
  | "activate"
  | "symbols"

type DialogState = { kind: BarDialogKind | null; bar: Bar | null }

/**
 * Orquesta la lista de bares: búsqueda, filtro por estado y el estado de
 * todos los diálogos. Un solo punto de control hace el módulo escalable.
 */
export function BaresManager({
  bars,
  onOpenSymbols,
}: {
  bars: Bar[]
  onOpenSymbols: (barId: string) => void
}) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<BarStatus | "all">("all")
  const [dialog, setDialog] = useState<DialogState>({ kind: null, bar: null })
  const [, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return bars.filter((b) => {
      const matchesQuery =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        (b.location?.toLowerCase().includes(q) ?? false)
      const matchesStatus = status === "all" || b.status === status
      return matchesQuery && matchesStatus
    })
  }, [bars, query, status])

  const open = (kind: BarDialogKind, bar: Bar) => {
    // "symbols" no abre diálogo: enfoca la sección de símbolos en el padre.
    if (kind === "symbols") {
      onOpenSymbols(bar.id)
      return
    }
    // Activar es reversible y seguro: se hace directo, sin confirmación.
    if (kind === "activate") {
      startTransition(() => {
        void withToast(() => setBarActive(bar.id, true), "Bar activado")
      })
      return
    }
    setDialog({ kind, bar })
  }
  const close = () => setDialog({ kind: null, bar: null })

  return (
    <>
      <div className="flex items-start gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Bares</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los bares activos, su ubicación, saldo y la distribución de ingresos.
          </p>
        </div>
        <Button className="ml-auto" onClick={() => setDialog({ kind: "create", bar: null })}>
          <Plus />
          Nuevo bar
        </Button>
      </div>

      <Card className="py-0">
        <CardHeader className="gap-1 border-b py-5">
          <CardTitle>Listado de bares</CardTitle>
          <CardDescription>Todos los bares registrados en la plataforma.</CardDescription>
        </CardHeader>

        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 border-b px-6 py-3.5">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, ubicación o slug…"
              className="pl-8"
            />
          </div>
          <ToggleGroup
            type="single"
            value={status}
            onValueChange={(v) => v && setStatus(v as BarStatus | "all")}
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
        </div>

        <CardContent className="px-0 pb-0">
          <BaresTable bars={filtered} onAction={open} />
        </CardContent>
      </Card>

      {/* diálogos */}
      <BarFormDialog
        open={dialog.kind === "create" || dialog.kind === "edit"}
        bar={dialog.kind === "edit" ? dialog.bar : null}
        onClose={close}
      />
      <RechargeDialog
        open={dialog.kind === "recharge"}
        bar={dialog.bar}
        onClose={close}
      />
      <FreePlaysDialog
        open={dialog.kind === "freeplays"}
        bar={dialog.bar}
        onClose={close}
      />
      <BarImageDialog
        open={dialog.kind === "image"}
        bar={dialog.bar}
        onClose={close}
      />
      <DeactivateBarDialog
        open={dialog.kind === "deactivate"}
        bar={dialog.bar}
        onClose={close}
      />
    </>
  )
}
