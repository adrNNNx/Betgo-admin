"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { ChevronLeft, ChevronRight, History, Loader2, Search } from "lucide-react"

import type { MovementType, PoolMovement } from "@/lib/pozo/types"
import { fetchMovements } from "@/lib/pozo/actions"
import { jackpotMovementView } from "@/lib/pozo/jackpots"
import { formatDateTime, formatNumber } from "@/lib/pozo/format"
import { HISTORY_FILTERS, HISTORY_PAGE_SIZE } from "@/config/pozo"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { MovementTypeBadge } from "@/components/pozo/movement-type-badge"

const DETAIL_FALLBACK: Record<MovementType, string> = {
  game_spin: "Aporte por tirada",
  topup: "Recarga de bar",
  adjust: "Ajuste de administrador",
  payout: "Pozo ganado",
}

/**
 * Detalle de la fila. En los pozos ganados mostramos el folio —es lo que el
 * ganador dicta por WhatsApp— y, si ya se pagó, cuándo.
 */
function MovementDetail({ movement }: { movement: PoolMovement }) {
  if (movement.type !== "payout") {
    return (
      <span className="text-[12.5px] text-muted-foreground">
        {DETAIL_FALLBACK[movement.type]}
      </span>
    )
  }

  const { folio } = jackpotMovementView(movement.jackpot)
  const paidAt = movement.jackpot?.paidAt

  return (
    <span className="text-[12.5px] text-muted-foreground">
      {folio ? (
        <span className="font-mono font-medium text-foreground">{folio}</span>
      ) : (
        // Ganado antes del comprobante: se acreditaba al saldo del jugador.
        "Acreditado al saldo"
      )}
      {paidAt && (
        <span className="block text-[11px]">
          Pagado el {formatDateTime(paidAt).date}
        </span>
      )}
    </span>
  )
}

type Category = MovementType | "all"

/**
 * Historial del pozo con paginación server-side (50/página), scroll dentro de
 * la página y filtros/búsqueda que aplican sobre todo el historial. La primera
 * página llega por SSR (`initialData`); el resto se pide con un server action.
 */
export function PoolHistoryTable({
  initialData,
  total: initialTotal,
  refreshToken,
}: {
  initialData: PoolMovement[]
  total: number
  refreshToken: number
}) {
  const [category, setCategory] = useState<Category>("all")
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [data, setData] = useState(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [pending, startTransition] = useTransition()
  const firstRender = useRef(true)

  // Debounce de la búsqueda → resetea a la primera página.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(0)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  // Carga la página cuando cambian filtros / página, o cuando se pide refrescar
  // (p. ej. tras un ajuste manual). La primera renderización usa `initialData`.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    startTransition(async () => {
      const res = await fetchMovements({
        offset: page * HISTORY_PAGE_SIZE,
        limit: HISTORY_PAGE_SIZE,
        category,
        search,
      })
      setData(res.data)
      setTotal(res.total)
    })
  }, [category, search, page, refreshToken])

  const pageCount = Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE))
  const from = total === 0 ? 0 : page * HISTORY_PAGE_SIZE + 1
  const to = Math.min(total, (page + 1) * HISTORY_PAGE_SIZE)

  return (
    <Card className="py-0">
      <CardHeader className="gap-1 border-b py-5">
        <CardTitle className="flex items-center gap-2">
          <History className="size-4 text-muted-foreground" />
          Historial del pozo
        </CardTitle>
        <CardDescription>
          Movimientos sobre la porción de pozo global: jugadas, recargas,
          ajustes y pozos ganados. El pozo se descuenta al ganarse; el pago al
          ganador se resuelve en la pestaña “Pozos ganados”.
        </CardDescription>
      </CardHeader>

      <CardContent className="py-6">
        {/* toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar en notas…"
              className="pl-8"
            />
          </div>

          <ToggleGroup
            type="single"
            value={category}
            onValueChange={(v) => {
              if (!v) return
              setCategory(v as Category)
              setPage(0)
            }}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            {HISTORY_FILTERS.map((f) => (
              <ToggleGroupItem key={f.value} value={f.value}>
                {f.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {total} {total === 1 ? "registro" : "registros"}
          </span>
        </div>

        {/* tabla (scroll interno, header fijo) */}
        <div
          className={cn(
            "max-h-[560px] overflow-auto rounded-lg border transition-opacity",
            pending && "pointer-events-none opacity-60"
          )}
          aria-busy={pending}
        >
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              <TableRow className="hover:bg-transparent">
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Aporte al pozo</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No hay movimientos que coincidan con el filtro.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((m) => {
                  const { date, time } = formatDateTime(m.at)
                  const pos = m.poolDelta >= 0
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {date}{" "}
                        <span className="text-xs text-muted-foreground">{time}</span>
                      </TableCell>
                      <TableCell>
                        <MovementTypeBadge movement={m} />
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            "font-semibold tabular-nums whitespace-nowrap",
                            pos
                              ? "text-emerald-600 dark:text-emerald-500"
                              : "text-red-600 dark:text-red-500"
                          )}
                        >
                          {pos ? "+" : "−"}
                          <span className="mr-0.5 text-[11px] font-medium opacity-75">
                            Gs.
                          </span>
                          {/* El signo lo pone el prefijo: `poolDelta` ya viene
                              negativo en los egresos y duplicaría el "−". */}
                          {formatNumber(Math.abs(m.poolDelta))}
                        </span>
                      </TableCell>
                      <TableCell>
                        <MovementDetail movement={m} />
                      </TableCell>
                      <TableCell className="max-w-56 text-[12.5px] text-muted-foreground">
                        {m.notes || "—"}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* paginación */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">
            {total === 0 ? "Sin movimientos" : `Mostrando ${from}–${to} de ${total}`}
          </span>
          <div className="flex items-center gap-2">
            {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
            <span className="text-xs text-muted-foreground tabular-nums">
              Página {page + 1} de {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || pending}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount - 1 || pending}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
