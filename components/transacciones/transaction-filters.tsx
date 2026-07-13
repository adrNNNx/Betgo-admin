"use client"

import { Search, X } from "lucide-react"

import type { BarOption, TransactionFilters } from "@/lib/transacciones/types"
import { CATEGORY_FILTERS } from "@/config/transacciones"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function TransactionFiltersBar({
  filters,
  bars,
  onFilters,
  onClear,
  hasActive,
}: {
  filters: TransactionFilters
  bars: BarOption[]
  onFilters: (patch: Partial<TransactionFilters>) => void
  onClear: () => void
  hasActive: boolean
}) {
  return (
    <div className="flex flex-wrap items-end gap-2.5">
      <div className="relative w-full min-w-[180px] max-w-xs">
        <Label className="sr-only">Buscar</Label>
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.query}
          onChange={(e) => onFilters({ query: e.target.value })}
          placeholder="Buscar por jugador, ref o nota…"
          className="pl-8"
        />
      </div>

      <Select value={filters.barId} onValueChange={(v) => onFilters({ barId: v })}>
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
        value={filters.category}
        onValueChange={(v) => onFilters({ category: v as TransactionFilters["category"] })}
      >
        <SelectTrigger size="sm" className="w-[160px]">
          <SelectValue placeholder="Todas" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_FILTERS.map((f) => (
            <SelectItem key={f.value} value={f.value}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          value={filters.from ?? ""}
          onChange={(e) => onFilters({ from: e.target.value || null })}
          className="h-8 w-[150px]"
          aria-label="Desde"
        />
        <span className="text-xs text-muted-foreground">a</span>
        <Input
          type="date"
          value={filters.to ?? ""}
          onChange={(e) => onFilters({ to: e.target.value || null })}
          className="h-8 w-[150px]"
          aria-label="Hasta"
        />
      </div>

      {hasActive && (
        <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
          <X className="size-4" />
          Limpiar
        </Button>
      )}
    </div>
  )
}
