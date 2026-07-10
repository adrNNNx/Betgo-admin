"use client"

import { useMemo, useState } from "react"
import { BarChart3, Settings2 } from "lucide-react"

import type { GlobalSymbol, PoolMovement, PoolState } from "@/lib/pozo/types"
import type { Prize, Scope, SlotSymbol } from "@/lib/premios/types"
import { symbolsForPrize } from "@/lib/premios/helpers"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PoolHero } from "@/components/pozo/pool-hero"
import { PoolKpis } from "@/components/pozo/pool-kpis"
import { ManualAdjustment } from "@/components/pozo/manual-adjustment"
import { PoolHistoryTable } from "@/components/pozo/pool-history-table"
import { GameCostConfig } from "@/components/pozo/game-cost-config"
import { GlobalSymbols } from "@/components/pozo/global-symbols"
import { PrizeTable } from "@/components/premios/prize-table"
import { PrizeFormDialog } from "@/components/premios/dialogs/prize-form-dialog"
import { DeletePrizeDialog } from "@/components/premios/dialogs/delete-prize-dialog"
import { AssignPrizeDialog } from "@/components/premios/dialogs/assign-prize-dialog"

/**
 * Orquesta el módulo Pozo global.
 *  - Resumen: saldo, ajustes y historial (estado optimista para feedback).
 *  - Configuración: costo por tirada, símbolos del pozo con su premio y el
 *    catálogo de premios del pozo. Prop-driven (revalidate refresca).
 *
 * Los premios del pozo son premios con barId = null; reutilizamos los
 * componentes del módulo Premios tratando al pozo como un ámbito ("global").
 */
export function PozoGlobal({
  pool: initialPool,
  movements,
  movementsTotal,
  symbols,
  prizes,
}: {
  pool: PoolState
  movements: PoolMovement[]
  movementsTotal: number
  symbols: GlobalSymbol[]
  prizes: Prize[]
}) {
  const [pool, setPool] = useState(initialPool)
  // Se incrementa tras un ajuste para que el historial recargue su primera página.
  const [historyRefresh, setHistoryRefresh] = useState(0)
  const [tab, setTab] = useState("resumen")

  // Diálogos de premios / asignación (reutilizados de Premios).
  const [prizeForm, setPrizeForm] = useState<{ open: boolean; prize: Prize | null }>({
    open: false,
    prize: null,
  })
  const [deletingPrize, setDeletingPrize] = useState<Prize | null>(null)
  const [assign, setAssign] = useState<{ open: boolean; symbol: SlotSymbol | null }>({
    open: false,
    symbol: null,
  })

  // El pozo como "ámbito" para los componentes de Premios.
  const scope: Scope = useMemo(
    () => ({
      id: "global",
      type: "global",
      name: "Pozo global",
      location: "Premios del pozo",
      barId: null,
      imageUrl: null,
      symbols: symbols.map((s) => ({
        id: s.id,
        name: s.name,
        emoji: s.imageUrl ?? s.emoji,
        weight: s.weight,
        prizeId: s.prizeId,
      })),
      prizes,
    }),
    [symbols, prizes]
  )

  function focusManual() {
    setTab("resumen")
    requestAnimationFrame(() => {
      document.getElementById("pozo-manual")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })
  }

  const openPrizeCreate = () => setPrizeForm({ open: true, prize: null })
  const openPrizeEdit = (prize: Prize) => setPrizeForm({ open: true, prize })

  const openAssign = (symbol: GlobalSymbol) =>
    setAssign({
      open: true,
      symbol: {
        id: symbol.id,
        name: symbol.name,
        emoji: symbol.imageUrl ?? symbol.emoji,
        weight: symbol.weight,
        prizeId: symbol.prizeId,
      },
    })

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Pozo global</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          Controla la bolsa de premios global, registra ajustes manuales,
          configura el costo por tirada, los símbolos y los premios del pozo.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="gap-6">
        <TabsList>
          <TabsTrigger value="resumen">
            <BarChart3 className="size-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings2 className="size-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="flex flex-col gap-6">
          <PoolHero pool={pool} onAdjust={focusManual} onConfig={() => setTab("config")} />
          <PoolKpis pool={pool} movementsTotal={movementsTotal} />
          <ManualAdjustment
            pool={pool}
            onApplied={(nextPool) => {
              setPool(nextPool)
              setHistoryRefresh((k) => k + 1)
            }}
          />
          <PoolHistoryTable
            initialData={movements}
            total={movementsTotal}
            refreshToken={historyRefresh}
          />
        </TabsContent>

        <TabsContent value="config" className="flex flex-col gap-6">
          <GameCostConfig
            cost={pool.costPerSpin}
            onSaved={(cost) => setPool((p) => ({ ...p, costPerSpin: cost }))}
          />
          <GlobalSymbols symbols={symbols} onAssign={openAssign} />
          <Card className="py-0">
            <PrizeTable
              scope={scope}
              onCreate={openPrizeCreate}
              onEdit={openPrizeEdit}
              onDelete={setDeletingPrize}
            />
          </Card>
        </TabsContent>
      </Tabs>

      <PrizeFormDialog
        open={prizeForm.open}
        scope={scope}
        prize={prizeForm.prize}
        onClose={() => setPrizeForm({ open: false, prize: null })}
      />
      <DeletePrizeDialog
        prize={deletingPrize}
        symbolCount={deletingPrize ? symbolsForPrize(scope, deletingPrize.id).length : 0}
        onClose={() => setDeletingPrize(null)}
      />
      <AssignPrizeDialog
        open={assign.open}
        scope={scope}
        symbol={assign.symbol}
        onClose={() => setAssign({ open: false, symbol: null })}
        onCreateNew={() => {
          setAssign({ open: false, symbol: null })
          openPrizeCreate()
        }}
      />
    </>
  )
}
