"use client"

import type { Prize, Scope, SlotSymbol } from "@/lib/premios/types"
import { isCritical, unassignedSymbols } from "@/lib/premios/helpers"
import { AssignSection } from "@/components/premios/assign-section"
import { PrizeTable } from "@/components/premios/prize-table"
import { ScopeAvatar } from "@/components/premios/prize-badges"
import { cn } from "@/lib/utils"

export function PrizePanel({
  scope,
  onCreate,
  onEdit,
  onDelete,
  onAssign,
}: {
  scope: Scope
  onCreate: () => void
  onEdit: (p: Prize) => void
  onDelete: (p: Prize) => void
  onAssign: (s: SlotSymbol) => void
}) {
  const total = scope.prizes.length
  const active = scope.prizes.filter((p) => p.status === "active").length
  const unass = unassignedSymbols(scope).length
  const crit = scope.prizes.filter(isCritical).length

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <ScopeAvatar
            scope={scope}
            color={scope.type === "global" ? "var(--gold, oklch(0.72 0.15 85))" : "oklch(0.55 0.16 255)"}
          />
          <span className="truncate font-semibold">{scope.name}</span>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <StatPill dotClass="bg-slate-500" value={total} label="premios" />
          <StatPill dotClass="bg-emerald-500" value={active} label="activos" />
          {unass > 0 ? (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-500">
              <strong className="font-semibold tabular-nums">{unass}</strong> sin asignar
            </span>
          ) : (
            <StatPill dotClass="bg-emerald-500" label="todo asignado" />
          )}
          {crit > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-400">
              <strong className="font-semibold tabular-nums">{crit}</strong> stock bajo
            </span>
          )}
        </div>
      </div>

      <AssignSection scope={scope} onAssign={onAssign} />
      <PrizeTable scope={scope} onCreate={onCreate} onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}

function StatPill({
  dotClass,
  value,
  label,
}: {
  dotClass: string
  value?: number
  label: string
}) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
      <span className={cn("size-[7px] rounded-full", dotClass)} />
      {value !== undefined && (
        <strong className="font-semibold tabular-nums text-foreground">{value}</strong>
      )}{" "}
      {label}
    </span>
  )
}
