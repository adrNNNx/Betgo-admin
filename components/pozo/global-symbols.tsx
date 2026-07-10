"use client"

import { useState } from "react"
import { Dices, Gift, Link as LinkIcon, Pencil, Plus } from "lucide-react"

import type { GlobalSymbol } from "@/lib/pozo/types"
import { formatPct } from "@/lib/pozo/format"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SymbolFormDialog } from "@/components/pozo/dialogs/symbol-form-dialog"

type DialogState = { open: boolean; symbol: GlobalSymbol | null }

/**
 * Grid de símbolos del pozo global: alta / edición / borrado (con imagen o
 * emoji) y la asignación del premio que otorga cada uno. La probabilidad se
 * calcula con el peso sobre el total. Prop-driven: las mutaciones revalidan.
 */
export function GlobalSymbols({
  symbols,
  onAssign,
}: {
  symbols: GlobalSymbol[]
  onAssign: (symbol: GlobalSymbol) => void
}) {
  const [dialog, setDialog] = useState<DialogState>({ open: false, symbol: null })

  const totalWeight = symbols.reduce((a, s) => a + (s.weight || 0), 0) || 1
  const withPrize = symbols.filter((s) => s.hasPrize).length
  const sorted = [...symbols].sort((a, b) => b.weight - a.weight)

  return (
    <>
      <Card className="py-0">
        <CardHeader className="flex-row items-center gap-4 border-b py-5">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Dices className="size-4 text-muted-foreground" />
              Símbolos del pozo global
            </CardTitle>
            <CardDescription>
              Símbolos de la tragaperras del pozo y el premio que otorga cada uno.
            </CardDescription>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline">
              {symbols.length} símbolos · {withPrize} con premio
            </span>
            <Button size="sm" onClick={() => setDialog({ open: true, symbol: null })}>
              <Plus className="size-4" />
              Nuevo símbolo
            </Button>
          </div>
        </CardHeader>

        <CardContent className="py-6">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5">
            {sorted.map((s) => {
              const prob = ((s.weight || 0) / totalWeight) * 100
              return (
                <div
                  key={s.id}
                  className="group relative flex flex-col items-center gap-2 rounded-lg border p-4 pt-[18px] transition-shadow hover:border-ring hover:shadow-sm"
                >
                  <button
                    type="button"
                    title="Editar símbolo"
                    onClick={() => setDialog({ open: true, symbol: s })}
                    className="absolute right-2 top-2 grid size-7 place-items-center rounded-sm border bg-background text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100"
                  >
                    <Pencil className="size-3.5" />
                  </button>

                  <SymbolThumb symbol={s} />
                  <div className="text-sm font-semibold">{s.name}</div>

                  <div className="mt-1 w-full">
                    <div className="flex items-baseline justify-between text-[11.5px] text-muted-foreground">
                      <span>Peso {s.weight}</span>
                      <span className="font-semibold tabular-nums text-foreground">
                        {formatPct(prob)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-[width]"
                        style={{ width: `${Math.max(2, prob)}%` }}
                      />
                    </div>
                  </div>

                  {/* premio asignado + acción */}
                  <div className="mt-1.5 w-full">
                    {s.hasPrize ? (
                      <span className="flex w-full items-center justify-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10.5px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-500">
                        <Gift className="size-3 shrink-0" />
                        <span className="truncate">{s.prizeName ?? "Con premio"}</span>
                      </span>
                    ) : (
                      <span className="block rounded-full bg-secondary px-2.5 py-0.5 text-center text-[10.5px] font-medium text-muted-foreground">
                        Sin premio
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="xs"
                      className="mt-1.5 w-full text-muted-foreground"
                      onClick={() => onAssign(s)}
                    >
                      <LinkIcon className="size-3" />
                      {s.hasPrize ? "Cambiar premio" : "Asignar premio"}
                    </Button>
                  </div>
                </div>
              )
            })}

            <button
              type="button"
              onClick={() => setDialog({ open: true, symbol: null })}
              className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
            >
              <Plus className="size-5" />
              <span className="text-sm font-medium">Nuevo símbolo</span>
            </button>
          </div>
        </CardContent>
      </Card>

      <SymbolFormDialog
        open={dialog.open}
        symbol={dialog.symbol}
        onClose={() => setDialog({ open: false, symbol: null })}
      />
    </>
  )
}

function SymbolThumb({ symbol }: { symbol: GlobalSymbol }) {
  if (symbol.imageUrl) {
    return (
      <div className="grid size-[60px] place-items-center overflow-hidden rounded-md bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={symbol.imageUrl} alt={symbol.name} className="size-full object-cover" />
      </div>
    )
  }
  return (
    <div className="grid size-[60px] place-items-center rounded-md bg-secondary text-[34px] leading-none">
      {symbol.emoji}
    </div>
  )
}
