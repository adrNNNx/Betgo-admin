"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"

import type { Bar, BarSymbol } from "@/lib/bares/types"
import { SymbolDialog } from "@/components/bares/dialogs/symbol-dialog"
import { DeleteSymbolDialog } from "@/components/bares/dialogs/delete-symbol-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// El símbolo puede ser un emoji o una URL de imagen (ej. Cloudinary).
const isImageUrl = (s: string) => /^https?:\/\//.test(s) || s.startsWith("/")

/**
 * Configuración de símbolos de la máquina tragaperras, por bar.
 * El selector de bar es un Tabs; cada bar tiene su propia grilla.
 * El bar activo es controlado por el padre (BaresScreen) para poder enfocarlo
 * desde la acción "Símbolos de la máquina" de la tabla.
 */
export function BarSymbols({
  bars,
  activeBarId,
  onActiveBarChange,
}: {
  bars: Bar[]
  activeBarId: string
  onActiveBarChange: (barId: string) => void
}) {
  const [editing, setEditing] = useState<BarSymbol | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState<BarSymbol | null>(null)
  const bar = bars.find((b) => b.id === activeBarId) ?? bars[0]

  if (!bar) return null

  const openNew = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (sym: BarSymbol) => {
    setEditing(sym)
    setDialogOpen(true)
  }

  return (
    <Card className="py-0">
      <CardHeader className="flex-row items-center gap-4 border-b py-5">
        <div className="space-y-1">
          <CardTitle>Configuración de símbolos</CardTitle>
          <CardDescription>
            Gestiona los símbolos de la máquina tragaperras para cada bar.
          </CardDescription>
        </div>
        <Tabs
          value={bar.id}
          onValueChange={onActiveBarChange}
          className="ml-auto"
        >
          <TabsList>
            {bars.map((b) => (
              <TabsTrigger key={b.id} value={b.id}>
                {b.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 p-6">
        {bar.symbols.map((sym) => (
          <div
            key={sym.id}
            className="group relative flex flex-col items-center gap-2 rounded-lg border p-5 transition-shadow hover:shadow-sm"
          >
            <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => openEdit(sym)}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => setDeleting(sym)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            {isImageUrl(sym.emoji) ? (
              // ponytail: <img> plano evita configurar remotePatterns de
              // next/image para Cloudinary; son miniaturas chicas.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sym.emoji}
                alt={sym.name}
                className="size-14 rounded object-contain"
              />
            ) : (
              <span className="text-4xl leading-none">{sym.emoji}</span>
            )}
            <span className="font-semibold">{sym.name}</span>
            <span className="text-[11px] text-muted-foreground">Peso: {sym.weight}</span>
            {sym.hasPrize && (
              <Badge
                variant="outline"
                className="border-transparent bg-emerald-50 text-emerald-700"
              >
                Con premio
              </Badge>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={openNew}
          className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
        >
          <Plus className="size-5" />
          <span className="text-sm font-medium">Nuevo símbolo</span>
        </button>
      </CardContent>

      <SymbolDialog
        open={dialogOpen}
        barId={bar.id}
        symbol={editing}
        onClose={() => setDialogOpen(false)}
      />
      <DeleteSymbolDialog
        barId={bar.id}
        symbol={deleting}
        onClose={() => setDeleting(null)}
      />
    </Card>
  )
}
