"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"

import type { Bar } from "@/lib/bares/types"
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

/**
 * Configuración de símbolos de la máquina tragaperras, por bar.
 * El selector de bar es un Tabs; cada bar tiene su propia grilla.
 * El alta/edición real de símbolos se conectará a un diálogo + server action.
 */
export function BarSymbols({ bars }: { bars: Bar[] }) {
  const [active, setActive] = useState(bars[0]?.id ?? "")
  const bar = bars.find((b) => b.id === active) ?? bars[0]

  if (!bar) return null

  return (
    <Card className="py-0">
      <CardHeader className="flex-row items-center gap-4 border-b py-5">
        <div className="space-y-1">
          <CardTitle>Configuración de símbolos</CardTitle>
          <CardDescription>
            Gestiona los símbolos de la máquina tragaperras para cada bar.
          </CardDescription>
        </div>
        <Tabs value={active} onValueChange={setActive} className="ml-auto">
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
              <Button variant="outline" size="icon" className="size-7">
                <Pencil className="size-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="size-7">
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            <span className="text-4xl leading-none">{sym.emoji}</span>
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
          className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
        >
          <Plus className="size-5" />
          <span className="text-sm font-medium">Nuevo símbolo</span>
        </button>
      </CardContent>
    </Card>
  )
}
