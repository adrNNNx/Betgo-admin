"use client"

import { useMemo, useState } from "react"
import { List, Plus, Search } from "lucide-react"

import type { Prize, PrizeStatus, PrizeType, Scope } from "@/lib/premios/types"
import { symbolsForPrize } from "@/lib/premios/helpers"
import { PRIZE_STATUS_FILTERS, PRIZE_TYPE_FILTERS } from "@/config/premios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Money,
  PrizeStatusBadge,
  StockBadge,
  SymbolThumb,
  TipoBadge,
} from "@/components/premios/prize-badges"
import { PrizeRowActions } from "@/components/premios/prize-row-actions"

export function PrizeTable({
  scope,
  onCreate,
  onEdit,
  onDelete,
}: {
  scope: Scope
  onCreate: () => void
  onEdit: (p: Prize) => void
  onDelete: (p: Prize) => void
}) {
  const [search, setSearch] = useState("")
  const [tipo, setTipo] = useState<PrizeType | "all">("all")
  const [estado, setEstado] = useState<PrizeStatus | "all">("all")

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return scope.prizes.filter((p) => {
      const matchesType = tipo === "all" || p.type === tipo
      const matchesStatus = estado === "all" || p.status === estado
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
      return matchesType && matchesStatus && matchesQuery
    })
  }, [scope.prizes, search, tipo, estado])

  return (
    <div className="px-5 py-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <h4 className="flex items-center gap-1.5 text-sm font-semibold">
            <List className="size-4" /> Premios del ámbito
          </h4>
          <p className="text-xs text-muted-foreground">
            Catálogo completo. Filtra por tipo o estado para ubicarlos rápido.
          </p>
        </div>
        <Button size="sm" className="ml-auto" onClick={onCreate}>
          <Plus /> Nuevo premio
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <div className="relative w-full min-w-[150px] max-w-[280px]">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar premio…"
            className="pl-8"
          />
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <ToggleGroup
            type="single"
            value={tipo}
            onValueChange={(v) => v && setTipo(v as PrizeType | "all")}
            variant="outline"
            size="sm"
          >
            {PRIZE_TYPE_FILTERS.map((o) => (
              <ToggleGroupItem key={o.value} value={o.value}>
                {o.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ToggleGroup
            type="single"
            value={estado}
            onValueChange={(v) => v && setEstado(v as PrizeStatus | "all")}
            variant="outline"
            size="sm"
          >
            {PRIZE_STATUS_FILTERS.map((o) => (
              <ToggleGroupItem key={o.value} value={o.value}>
                {o.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {rows.length} de {scope.prizes.length}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Premio</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor estimado</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Símbolos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  Ningún premio coincide con los filtros.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((p) => {
                const syms = symbolsForPrize(scope, p.id)
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-semibold">{p.name}</div>
                      {p.desc && (
                        <div className="max-w-[280px] truncate text-xs text-muted-foreground">
                          {p.desc}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <TipoBadge type={p.type} />
                    </TableCell>
                    <TableCell>
                      <Money value={p.value} />
                    </TableCell>
                    <TableCell>
                      <StockBadge prize={p} />
                    </TableCell>
                    <TableCell>
                      {syms.length === 0 ? (
                        <span className="text-sm text-muted-foreground">—</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-1.5">
                            {syms.slice(0, 3).map((s) => (
                              <SymbolThumb
                                key={s.id}
                                symbol={s}
                                className="size-6 text-sm ring-1 ring-background"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {syms.length} símbolo{syms.length === 1 ? "" : "s"}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <PrizeStatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <PrizeRowActions
                        prize={p}
                        barId={scope.barId}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
