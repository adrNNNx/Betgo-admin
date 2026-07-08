"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import type { Prize, Scope, SlotSymbol } from "@/lib/premios/types"
import { symbolsForPrize } from "@/lib/premios/helpers"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScopeRail } from "@/components/premios/scope-rail"
import { PrizePanel } from "@/components/premios/prize-panel"
import { PrizeFormDialog } from "@/components/premios/dialogs/prize-form-dialog"
import { AssignPrizeDialog } from "@/components/premios/dialogs/assign-prize-dialog"
import { DeletePrizeDialog } from "@/components/premios/dialogs/delete-prize-dialog"

/**
 * Orquesta la sección de premios: ámbito activo (rail maestro/detalle) y el
 * estado de los tres diálogos (alta/edición, asignación y borrado).
 */
export function PremiosManager({ scopes }: { scopes: Scope[] }) {
  const [activeId, setActiveId] = useState(scopes[0]?.id ?? "")
  const [form, setForm] = useState<{ open: boolean; prize: Prize | null }>({
    open: false,
    prize: null,
  })
  const [assign, setAssign] = useState<{ open: boolean; symbol: SlotSymbol | null }>({
    open: false,
    symbol: null,
  })
  const [deleting, setDeleting] = useState<Prize | null>(null)

  const activeScope = scopes.find((s) => s.id === activeId) ?? scopes[0]

  if (!activeScope) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Premios</CardTitle>
          <CardDescription>
            Todavía no hay bares ni pozo configurados.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const openCreate = () => setForm({ open: true, prize: null })
  const openEdit = (prize: Prize) => setForm({ open: true, prize })
  const createFromAssign = () => {
    setAssign({ open: false, symbol: null })
    openCreate()
  }

  return (
    <>
      <div className="flex items-start gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Premios</h1>
          <p className="max-w-prose text-sm text-muted-foreground">
            Administra los premios de cada bar y del pozo nacional, y asígnalos a
            los símbolos que los otorgan.
          </p>
        </div>
        <Button className="ml-auto" onClick={openCreate}>
          <Plus />
          Nuevo premio
        </Button>
      </div>

      <Card className="overflow-hidden py-0">
        <CardHeader className="gap-1 border-b py-5">
          <CardTitle>Premios por ámbito</CardTitle>
          <CardDescription>
            Elige un ámbito para ver sus premios y asignarlos a los símbolos de su
            tragamonedas.
          </CardDescription>
        </CardHeader>
        <div className="grid md:grid-cols-[264px_1fr]">
          <ScopeRail scopes={scopes} activeId={activeScope.id} onSelect={setActiveId} />
          <PrizePanel
            scope={activeScope}
            onCreate={openCreate}
            onEdit={openEdit}
            onDelete={setDeleting}
            onAssign={(s) => setAssign({ open: true, symbol: s })}
          />
        </div>
      </Card>

      <PrizeFormDialog
        open={form.open}
        scope={activeScope}
        prize={form.prize}
        onClose={() => setForm({ open: false, prize: null })}
      />
      <AssignPrizeDialog
        open={assign.open}
        scope={activeScope}
        symbol={assign.symbol}
        onClose={() => setAssign({ open: false, symbol: null })}
        onCreateNew={createFromAssign}
      />
      <DeletePrizeDialog
        prize={deleting}
        symbolCount={deleting ? symbolsForPrize(activeScope, deleting.id).length : 0}
        onClose={() => setDeleting(null)}
      />
    </>
  )
}
