"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { Download } from "lucide-react"

import type {
  BarOption,
  Transaction,
  TransactionFilters,
  TransactionSummary,
} from "@/lib/transacciones/types"
import { DEFAULT_FILTERS } from "@/lib/transacciones/types"
import { queryTransactions } from "@/lib/transacciones/actions"
import {
  CATEGORY_META,
  formatDate,
  formatTime,
} from "@/lib/transacciones/utils"
import { TX_PAGE_SIZE } from "@/config/transacciones"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TransactionSummaryCards } from "@/components/transacciones/transaction-summary"
import { TransactionFiltersBar } from "@/components/transacciones/transaction-filters"
import { TransactionsTable } from "@/components/transacciones/transactions-table"
import { TransactionDetailDrawer } from "@/components/transacciones/transaction-detail-drawer"

export function TransaccionesScreen({
  initialData,
  initialTotal,
  initialSummary,
  bars,
}: {
  initialData: Transaction[]
  initialTotal: number
  initialSummary: TransactionSummary
  bars: BarOption[]
}) {
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS)
  const [committedQuery, setCommittedQuery] = useState("")
  const [page, setPage] = useState(0)
  const [data, setData] = useState(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [summary, setSummary] = useState(initialSummary)
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [pending, startTransition] = useTransition()
  const firstRender = useRef(true)

  // Debounce de la búsqueda → resetea a la primera página.
  useEffect(() => {
    const t = setTimeout(() => {
      setCommittedQuery(filters.query.trim())
      setPage(0)
    }, 300)
    return () => clearTimeout(t)
  }, [filters.query])

  // Carga lista + resumen cuando cambian filtros / página.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    startTransition(async () => {
      const res = await queryTransactions(
        { ...filters, query: committedQuery },
        page * TX_PAGE_SIZE,
        TX_PAGE_SIZE
      )
      setData(res.data)
      setTotal(res.total)
      setSummary(res.summary)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.barId, filters.category, filters.from, filters.to, committedQuery, page])

  const onFilters = (patch: Partial<TransactionFilters>) => {
    setFilters((f) => ({ ...f, ...patch }))
    if (!("query" in patch)) setPage(0)
  }
  const onClear = () => {
    setFilters(DEFAULT_FILTERS)
    setPage(0)
  }

  const hasActive = useMemo(
    () =>
      filters.query !== "" ||
      filters.barId !== "all" ||
      filters.category !== "all" ||
      filters.from !== null ||
      filters.to !== null,
    [filters]
  )

  return (
    <>
      <div className="flex items-start gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Transacciones</h1>
          <p className="max-w-prose text-sm text-muted-foreground">
            Movimientos de la plataforma: jugadas, recargas, premios e ingresos.
          </p>
        </div>
        <Button
          variant="outline"
          className="ml-auto"
          onClick={() => exportCsv(data)}
          disabled={data.length === 0}
        >
          <Download />
          Exportar CSV
        </Button>
      </div>

      <TransactionSummaryCards summary={summary} />

      <Card className="py-0">
        <CardHeader className="gap-1 border-b py-5">
          <CardTitle>Listado de transacciones</CardTitle>
          <CardDescription>
            Filtra y explora cada movimiento. Haz clic en una fila para ver el detalle.
          </CardDescription>
        </CardHeader>
        <div className="border-b px-6 py-3.5">
          <TransactionFiltersBar
            filters={filters}
            bars={bars}
            onFilters={onFilters}
            onClear={onClear}
            hasActive={hasActive}
          />
        </div>
        <CardContent className="py-6">
          <TransactionsTable
            data={data}
            total={total}
            page={page}
            pending={pending}
            onPage={setPage}
            onSelect={setSelected}
          />
        </CardContent>
      </Card>

      <TransactionDetailDrawer tx={selected} onClose={() => setSelected(null)} />
    </>
  )
}

// Export CSV de la página actual (client-side).
function exportCsv(rows: Transaction[]) {
  const cell = (v: string) => `"${v.replace(/"/g, '""')}"`
  const headers = ["Fecha", "Ref", "Tipo", "Bar", "Jugador", "Monto"]
  const lines = rows.map((t) =>
    [
      `${formatDate(t.timestamp)} ${formatTime(t.timestamp)}`,
      t.ref,
      CATEGORY_META[t.category].label,
      t.barName ?? "",
      t.playerName ?? t.playerId ?? "",
      String(t.amount),
    ]
      .map(cell)
      .join(",")
  )
  const csv = [headers.map(cell).join(","), ...lines].join("\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const a = document.createElement("a")
  a.href = url
  a.download = `transacciones-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
