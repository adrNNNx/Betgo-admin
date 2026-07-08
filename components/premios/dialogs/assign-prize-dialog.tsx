"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { Plus, Search } from "lucide-react"

import type { Scope, SlotSymbol } from "@/lib/premios/types"
import { formatPct, stockInfo, symTotal } from "@/lib/premios/helpers"
import { assignSymbolPrize } from "@/lib/premios/actions"
import { withToast } from "@/lib/run-action"
import { formatGs } from "@/lib/format"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SymbolThumb, TipoBadge } from "@/components/premios/prize-badges"
import { cn } from "@/lib/utils"

/**
 * Selecciona qué premio otorga un símbolo. Clic en el premio ya elegido lo
 * deselecciona (queda "sin asignar").
 */
export function AssignPrizeDialog({
  open,
  scope,
  symbol,
  onClose,
  onCreateNew,
}: {
  open: boolean
  scope: Scope
  symbol: SlotSymbol | null
  onClose: () => void
  onCreateNew: () => void
}) {
  const [q, setQ] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (open && symbol) {
      setSelected(symbol.prizeId ?? null)
      setQ("")
    }
  }, [open, symbol])

  const list = useMemo(() => {
    const query = q.trim().toLowerCase()
    return scope.prizes
      .filter((p) => p.status === "active")
      .filter((p) => !query || p.name.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name, "es"))
  }, [scope.prizes, q])

  if (!symbol) return null

  const total = symTotal(scope)

  const submit = () => {
    startTransition(async () => {
      const ok = await withToast(
        () => assignSymbolPrize(symbol.id, selected),
        selected ? "Premio asignado" : "Símbolo sin premio"
      )
      if (ok) onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar premio</DialogTitle>
          <DialogDescription>
            Elige qué premio otorga este símbolo al alinearse.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg border bg-secondary/40 p-3">
          <SymbolThumb symbol={symbol} className="size-10 flex-none text-2xl" />
          <div className="min-w-0">
            <div className="truncate font-semibold">{symbol.name}</div>
            <div className="text-xs text-muted-foreground">
              Peso {symbol.weight} · {formatPct((symbol.weight / total) * 100)} de probabilidad
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar premio…"
            className="pl-8"
          />
        </div>

        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {list.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No hay premios activos que coincidan. Crea uno nuevo abajo.
            </p>
          ) : (
            list.map((p) => {
              const info = stockInfo(p)
              const isSel = selected === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(isSel ? null : p.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors hover:bg-accent",
                    isSel ? "border-ring bg-secondary" : "border-transparent"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-4 flex-none place-items-center rounded-full border",
                      isSel ? "border-primary" : "border-muted-foreground/40"
                    )}
                  >
                    {isSel && <span className="size-2 rounded-full bg-primary" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium">{p.name}</span>
                      <TipoBadge type={p.type} />
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {p.value ? formatGs(p.value) : "Sin valor"} · {info.label}
                    </span>
                  </span>
                </button>
              )
            })
          )}
        </div>

        <Button variant="outline" size="sm" onClick={onCreateNew} className="w-full">
          <Plus /> Crear un premio nuevo
        </Button>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={pending}>
            {selected ? "Asignar premio" : "Quitar premio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
