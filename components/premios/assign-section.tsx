"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Link as LinkIcon, Plus } from "lucide-react"

import type { Scope, SlotSymbol } from "@/lib/premios/types"
import { formatPct, prizeById, stockShort, symTotal, unassignedSymbols } from "@/lib/premios/helpers"
import { formatGs } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { SymbolThumb, TipoBadge } from "@/components/premios/prize-badges"
import { cn } from "@/lib/utils"

/**
 * Asignación símbolo → premio. Cada símbolo otorga un premio al alinearse; acá
 * no se crean símbolos, solo se les asigna el premio (backend: symbol.prizeId).
 */
export function AssignSection({
  scope,
  onAssign,
}: {
  scope: Scope
  onAssign: (symbol: SlotSymbol) => void
}) {
  const [assignOnly, setAssignOnly] = useState(false)
  const total = symTotal(scope)
  const unass = unassignedSymbols(scope).length

  const syms = useMemo(() => {
    let list = scope.symbols.map((s) => ({ ...s, prob: (s.weight / total) * 100 }))
    if (assignOnly) list = list.filter((s) => !s.prizeId)
    return [...list].sort(
      (a, b) => Number(!!a.prizeId) - Number(!!b.prizeId) || b.weight - a.weight
    )
  }, [scope.symbols, assignOnly, total])

  return (
    <div className="border-b px-5 py-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <h4 className="flex items-center gap-1.5 text-sm font-semibold">
            <LinkIcon className="size-4" /> Símbolos y sus premios
          </h4>
          <p className="text-xs text-muted-foreground">
            Cada símbolo otorga un premio al alinearse. Aquí se les asigna, no se crean.
          </p>
        </div>
        <ToggleGroup
          type="single"
          value={assignOnly ? "unassigned" : "all"}
          onValueChange={(v) => v && setAssignOnly(v === "unassigned")}
          variant="outline"
          size="sm"
          className="ml-auto"
        >
          <ToggleGroupItem value="all">Todos</ToggleGroupItem>
          <ToggleGroupItem value="unassigned">
            Sin asignar{unass ? ` · ${unass}` : ""}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {syms.length === 0 ? (
        <p className="px-3 py-8 text-center text-sm text-muted-foreground">
          {assignOnly
            ? "Todos los símbolos de este ámbito ya tienen premio asignado. 🎉"
            : "Este ámbito todavía no tiene símbolos. Se crean en la sección Bares."}
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
          {syms.map((s) => {
            const prize = s.prizeId ? prizeById(scope, s.prizeId) : null
            return (
              <div
                key={s.id}
                className={cn(
                  "flex flex-col gap-2.5 rounded-lg border p-3",
                  !prize && "border-amber-300/60 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/10"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <SymbolThumb symbol={s} className="size-9 flex-none text-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground">Peso {s.weight}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums">{formatPct(s.prob)}</div>
                    <div className="text-[10px] text-muted-foreground">prob.</div>
                  </div>
                </div>

                {prize ? (
                  <div className="flex items-center gap-2 rounded-md bg-secondary/60 px-2.5 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-medium">{prize.name}</span>
                        <TipoBadge type={prize.type} />
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {prize.value ? formatGs(prize.value) : "Sin valor"} · {stockShort(prize)}
                      </div>
                    </div>
                    <Button variant="ghost" size="xs" onClick={() => onAssign(s)}>
                      Cambiar
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-500">
                      <AlertTriangle className="size-3.5" /> Sin premio asignado
                    </span>
                    <Button size="xs" onClick={() => onAssign(s)}>
                      <Plus className="size-3.5" /> Asignar
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
