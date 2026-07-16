"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"

import type { Bar, BarSymbol } from "@/lib/bares/types"
import { SYMBOLS_PAGE_SIZE, SYMBOL_SORTS, type SymbolSortKey } from "@/config/bares"
import {
  formatProbability,
  isImageSrc,
  totalWeight,
  withProbabilities,
  type SymbolWithProbability,
} from "@/lib/bares/symbols"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { SymbolDialog } from "@/components/bares/dialogs/symbol-dialog"
import { DeleteSymbolDialog } from "@/components/bares/dialogs/delete-symbol-dialog"

/** Paleta estable para el avatar de cada bar (por índice). */
const AVATAR_COLORS = [
  "oklch(0.55 0.16 255)",
  "oklch(0.55 0.16 25)",
  "oklch(0.52 0.13 150)",
  "oklch(0.5 0.16 300)",
  "oklch(0.58 0.15 85)",
  "oklch(0.53 0.14 200)",
  "oklch(0.5 0.17 330)",
  "oklch(0.52 0.13 130)",
]

const STOP_WORDS = new Set([
  "bar", "the", "el", "la", "los", "las", "de", "irish", "pub", "club", "gaming", "&",
])

function barInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean)
  const sig = words.filter(
    (w) => !STOP_WORDS.has(w.toLowerCase().replace(/[^a-záéíóúñ0-9]/gi, ""))
  )
  const pick = sig.length ? sig : words
  const a = pick[0]?.[0] ?? ""
  const b = pick[1]?.[0] ?? pick[0]?.[1] ?? ""
  return (a + b).toUpperCase()
}

const LIST_COLS = "minmax(130px,1.4fr) 56px minmax(108px,1.3fr) 96px 66px"

/**
 * Configuración de símbolos de la máquina tragaperras, por bar — layout
 * maestro/detalle pensado para escalar:
 *  - Izquierda: lista de bares con buscador (escala a decenas de bares).
 *  - Derecha: resumen (símbolos / con premio / peso total), buscador + orden +
 *    vista grilla/lista, y la probabilidad real de cada símbolo (peso sobre el
 *    total). La vista lista soporta muchos símbolos de forma compacta.
 *
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
  const [barQuery, setBarQuery] = useState("")
  const [symQuery, setSymQuery] = useState("")
  const [sort, setSort] = useState<SymbolSortKey>("weight-desc")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [page, setPage] = useState(0)
  const [dialog, setDialog] = useState<{ open: boolean; symbol: BarSymbol | null }>({
    open: false,
    symbol: null,
  })
  const [deleting, setDeleting] = useState<BarSymbol | null>(null)

  const activeBarRef = useRef<HTMLButtonElement>(null)

  const bar = bars.find((b) => b.id === activeBarId) ?? bars[0]

  // Al cambiar de bar, buscar u ordenar, volvemos a la primera página.
  useEffect(() => {
    setPage(0)
  }, [activeBarId, symQuery, sort])

  // Trae el bar activo a la vista del rail (p. ej. al elegirlo desde la tabla).
  useEffect(() => {
    activeBarRef.current?.scrollIntoView({ block: "nearest" })
  }, [activeBarId])

  const filteredBars = useMemo(() => {
    const q = barQuery.trim().toLowerCase()
    return bars
      .map((b, index) => ({ bar: b, index }))
      .filter(
        ({ bar: b }) =>
          !q ||
          b.name.toLowerCase().includes(q) ||
          (b.location?.toLowerCase().includes(q) ?? false)
      )
  }, [bars, barQuery])

  const symbols = useMemo<SymbolWithProbability[]>(() => {
    if (!bar) return []
    const q = symQuery.trim().toLowerCase()
    let list = withProbabilities(bar.symbols)
    if (q) list = list.filter((s) => s.name.toLowerCase().includes(q))
    return [...list].sort((a, b) => {
      switch (sort) {
        case "weight-asc":
          return a.weight - b.weight
        case "name":
          return a.name.localeCompare(b.name, "es")
        case "prize":
          return Number(b.hasPrize) - Number(a.hasPrize) || b.weight - a.weight
        default:
          return b.weight - a.weight
      }
    })
  }, [bar, symQuery, sort])

  if (!bar) {
    return (
      <Card className="py-0">
        <CardHeader className="gap-1 py-5">
          <CardTitle>Configuración de símbolos</CardTitle>
          <CardDescription>
            Todavía no hay bares registrados. Crea un bar para configurar su máquina.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const barIndex = bars.findIndex((b) => b.id === bar.id)
  const total = totalWeight(bar.symbols)
  const withPrize = bar.symbols.filter((s) => s.hasPrize).length

  const pageCount = Math.max(1, Math.ceil(symbols.length / SYMBOLS_PAGE_SIZE))
  const pageSymbols = symbols.slice(
    page * SYMBOLS_PAGE_SIZE,
    (page + 1) * SYMBOLS_PAGE_SIZE
  )
  const from = symbols.length === 0 ? 0 : page * SYMBOLS_PAGE_SIZE + 1
  const to = Math.min(symbols.length, (page + 1) * SYMBOLS_PAGE_SIZE)

  const onEdit = (symbol: BarSymbol) => setDialog({ open: true, symbol })
  const onDelete = (symbol: BarSymbol) => setDeleting(symbol)

  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="gap-1 border-b py-5">
        <CardTitle>Configuración de símbolos</CardTitle>
        <CardDescription>
          Elige un bar y administra los símbolos de su tragamonedas. La probabilidad se
          calcula con el peso de cada símbolo sobre el total.
        </CardDescription>
      </CardHeader>

      <div className="grid md:grid-cols-[264px_1fr]">
        {/* ============ RAIL: selector de bar escalable ============ */}
        <aside className="flex flex-col border-b md:border-r md:border-b-0">
          <div className="relative border-b p-3">
            <Search className="absolute left-5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={barQuery}
              onChange={(e) => setBarQuery(e.target.value)}
              placeholder="Buscar bar…"
              className="pl-8"
            />
          </div>
          {/* Rail = selector: buscador + scroll (~10 bares visibles), no paginación. */}
          <div className="flex max-h-[460px] flex-col gap-0.5 overflow-y-auto p-2">
            {filteredBars.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                Sin resultados
              </p>
            ) : (
              filteredBars.map(({ bar: b, index }) => (
                <button
                  key={b.id}
                  type="button"
                  ref={b.id === bar.id ? activeBarRef : undefined}
                  onClick={() => onActiveBarChange(b.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md border border-transparent px-2 py-2 text-left transition-colors hover:bg-accent",
                    b.id === bar.id && "border-border bg-secondary"
                  )}
                >
                  <BarAvatar name={b.name} index={index} src={b.imageUrl} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13px] font-semibold">{b.name}</span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {b.location ?? "Sin ubicación"}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "grid h-5 min-w-[22px] place-items-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums text-muted-foreground",
                      b.id === bar.id ? "bg-background" : "bg-secondary"
                    )}
                  >
                    {b.symbols.length}
                  </span>
                </button>
              ))
            )}
          </div>
          {barQuery.trim() && filteredBars.length > 0 && (
            <p className="border-t px-3 py-2 text-[11px] text-muted-foreground tabular-nums">
              {filteredBars.length} de {bars.length} bares
            </p>
          )}
        </aside>

        {/* ============ PANEL: símbolos del bar activo ============ */}
        <div className="flex min-w-0 flex-col">
          {/* resumen */}
          <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <BarAvatar name={bar.name} index={barIndex} src={bar.imageUrl} />
              <span className="truncate font-semibold">{bar.name}</span>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              <StatPill dotClass="bg-slate-500" value={bar.symbols.length} label="símbolos" />
              <StatPill dotClass="bg-emerald-500" value={withPrize} label="con premio" />
              <span className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                peso total <strong className="font-semibold tabular-nums text-foreground">{total}</strong>
              </span>
            </div>
          </div>

          {/* toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 border-b px-5 py-3">
            <div className="relative w-full min-w-[150px] max-w-[280px]">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={symQuery}
                onChange={(e) => setSymQuery(e.target.value)}
                placeholder="Buscar símbolo…"
                className="pl-8"
              />
            </div>
            <div className="ml-auto flex items-center gap-2.5">
              <Select value={sort} onValueChange={(v) => setSort(v as SymbolSortKey)}>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SYMBOL_SORTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ToggleGroup
                type="single"
                value={view}
                onValueChange={(v) => v && setView(v as "grid" | "list")}
                variant="outline"
                size="sm"
              >
                <ToggleGroupItem value="grid" aria-label="Cuadrícula">
                  <LayoutGrid className="size-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="Lista">
                  <List className="size-4" />
                </ToggleGroupItem>
              </ToggleGroup>
              <Button size="sm" onClick={() => setDialog({ open: true, symbol: null })}>
                <Plus />
                Nuevo símbolo
              </Button>
            </div>
          </div>

          {/* contenido */}
          <div className="max-h-[520px] overflow-auto p-5">
            {symbols.length === 0 ? (
              <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                {symQuery
                  ? `Ningún símbolo coincide con “${symQuery}”.`
                  : "Este bar todavía no tiene símbolos. Agrega el primero."}
              </p>
            ) : view === "grid" ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-3.5">
                {pageSymbols.map((s) => (
                  <SymbolCard key={s.id} symbol={s} onEdit={onEdit} onDelete={onDelete} />
                ))}
                {page === pageCount - 1 && (
                  <button
                    type="button"
                    onClick={() => setDialog({ open: true, symbol: null })}
                    className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
                  >
                    <Plus className="size-5" />
                    <span className="text-sm font-medium">Nuevo símbolo</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex min-w-[470px] flex-col">
                <div
                  className="grid items-center gap-3 border-b px-1 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                  style={{ gridTemplateColumns: LIST_COLS }}
                >
                  <span className="truncate">Símbolo</span>
                  <span>Peso</span>
                  <span>Probabilidad</span>
                  <span>Premio</span>
                  <span className="text-right">Acciones</span>
                </div>
                {pageSymbols.map((s) => (
                  <SymbolRow key={s.id} symbol={s} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </div>
            )}
          </div>

          {/* paginación */}
          {symbols.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3.5">
              <span className="text-xs text-muted-foreground tabular-nums">
                Mostrando {from}–{to} de {symbols.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground tabular-nums">
                  Página {page + 1} de {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <SymbolDialog
        open={dialog.open}
        bar={bar}
        symbol={dialog.symbol}
        onClose={() => setDialog({ open: false, symbol: null })}
      />
      <DeleteSymbolDialog
        barId={bar.id}
        symbol={deleting}
        onClose={() => setDeleting(null)}
      />
    </Card>
  )
}

/* ============================================================ */
/* SUBCOMPONENTES                                               */
/* ============================================================ */

function BarAvatar({
  name,
  index,
  src,
}: {
  name: string
  index: number
  src?: string | null
}) {
  if (src) {
    return (
      <span className="grid size-[30px] flex-none place-items-center overflow-hidden rounded-sm bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={name} className="size-full object-cover" />
      </span>
    )
  }
  return (
    <span
      className="grid size-[30px] flex-none place-items-center rounded-sm text-[11px] font-bold tracking-wide text-white"
      style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
    >
      {barInitials(name)}
    </span>
  )
}

function StatPill({
  dotClass,
  value,
  label,
}: {
  dotClass: string
  value: number
  label: string
}) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
      <span className={cn("size-[7px] rounded-full", dotClass)} />
      <strong className="font-semibold tabular-nums text-foreground">{value}</strong> {label}
    </span>
  )
}

function SymbolThumb({
  symbol,
  size,
}: {
  symbol: BarSymbol
  size: "lg" | "sm"
}) {
  const box =
    size === "lg" ? "size-[54px] rounded-md text-3xl" : "size-9 flex-none rounded-sm text-xl"
  return (
    <span className={cn("grid place-items-center overflow-hidden bg-secondary leading-none", box)}>
      {isImageSrc(symbol.emoji) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={symbol.emoji} alt={symbol.name} className="size-full object-cover" />
      ) : (
        symbol.emoji
      )}
    </span>
  )
}

function ProbBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className="h-full rounded-full bg-blue-500"
        style={{ width: `${Math.max(2, value)}%` }}
      />
    </div>
  )
}

function PrizeBadge() {
  return (
    <Badge
      variant="outline"
      className="border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
    >
      Con premio
    </Badge>
  )
}

function RowActions({
  symbol,
  onEdit,
  onDelete,
}: {
  symbol: BarSymbol
  onEdit: (s: BarSymbol) => void
  onDelete: (s: BarSymbol) => void
}) {
  return (
    <>
      <Button variant="outline" size="icon" className="size-7" onClick={() => onEdit(symbol)}>
        <Pencil className="size-3.5" />
      </Button>
      <Button variant="outline" size="icon" className="size-7" onClick={() => onDelete(symbol)}>
        <Trash2 className="size-3.5" />
      </Button>
    </>
  )
}

function SymbolCard({
  symbol,
  onEdit,
  onDelete,
}: {
  symbol: SymbolWithProbability
  onEdit: (s: BarSymbol) => void
  onDelete: (s: BarSymbol) => void
}) {
  return (
    <div className="group relative flex flex-col items-center gap-2 rounded-lg border p-5 transition-shadow hover:shadow-sm">
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <RowActions symbol={symbol} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <SymbolThumb symbol={symbol} size="lg" />
      <span className="font-semibold">{symbol.name}</span>
      <div className="w-full">
        <div className="flex items-baseline justify-between text-[11.5px] text-muted-foreground">
          <span>Peso {symbol.weight}</span>
          <span className="font-semibold tabular-nums text-foreground">
            {formatProbability(symbol.probability)}
          </span>
        </div>
        <ProbBar value={symbol.probability} className="mt-1.5" />
      </div>
      {symbol.hasPrize && <PrizeBadge />}
    </div>
  )
}

function SymbolRow({
  symbol,
  onEdit,
  onDelete,
}: {
  symbol: SymbolWithProbability
  onEdit: (s: BarSymbol) => void
  onDelete: (s: BarSymbol) => void
}) {
  return (
    <div
      className="grid items-center gap-3 border-b px-1 py-2.5 transition-colors last:border-0 hover:bg-muted/50"
      style={{ gridTemplateColumns: LIST_COLS }}
    >
      <span className="flex min-w-0 items-center gap-3">
        <SymbolThumb symbol={symbol} size="sm" />
        <span className="truncate text-[13.5px] font-semibold">{symbol.name}</span>
      </span>
      <span className="grid h-6 min-w-[26px] place-items-center rounded-sm bg-secondary px-1.5 text-[12.5px] font-semibold tabular-nums">
        {symbol.weight}
      </span>
      <span className="flex items-center gap-2.5">
        <ProbBar value={symbol.probability} className="flex-1" />
        <span className="min-w-[42px] text-right text-xs tabular-nums text-muted-foreground">
          {formatProbability(symbol.probability)}
        </span>
      </span>
      <span>{symbol.hasPrize ? <PrizeBadge /> : <span className="text-muted-foreground">—</span>}</span>
      <span className="flex justify-end gap-1">
        <RowActions symbol={symbol} onEdit={onEdit} onDelete={onDelete} />
      </span>
    </div>
  )
}
