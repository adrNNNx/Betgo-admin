"use client"

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

import type { Transaction } from "@/lib/transacciones/types"
import { formatDate, formatGs, formatTime, txSign } from "@/lib/transacciones/utils"
import { TX_PAGE_SIZE } from "@/config/transacciones"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TransactionTypeBadge } from "@/components/transacciones/transaction-type-badge"
import { cn } from "@/lib/utils"

export function TransactionsTable({
  data,
  total,
  page,
  pending,
  onPage,
  onSelect,
}: {
  data: Transaction[]
  total: number
  page: number
  pending: boolean
  onPage: (page: number) => void
  onSelect: (tx: Transaction) => void
}) {
  const pageCount = Math.max(1, Math.ceil(total / TX_PAGE_SIZE))
  const from = total === 0 ? 0 : page * TX_PAGE_SIZE + 1
  const to = Math.min(total, (page + 1) * TX_PAGE_SIZE)

  return (
    <div className="space-y-4">
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
              <TableHead>Ref</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Bar</TableHead>
              <TableHead>Jugador</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  No hay transacciones que coincidan con los filtros.
                </TableCell>
              </TableRow>
            ) : (
              data.map((t) => {
                const sign = txSign(t)
                return (
                  <TableRow
                    key={t.id}
                    onClick={() => onSelect(t)}
                    className="cursor-pointer"
                  >
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {formatDate(t.timestamp)}{" "}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(t.timestamp)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {t.ref}
                    </TableCell>
                    <TableCell>
                      <TransactionTypeBadge category={t.category} />
                    </TableCell>
                    <TableCell className="text-sm">{t.barName ?? "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">
                      {t.playerName ?? (
                        <span className="font-mono text-xs text-muted-foreground">
                          {t.playerId?.slice(0, 8) ?? "—"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "font-semibold tabular-nums whitespace-nowrap",
                          sign > 0 && "text-emerald-600 dark:text-emerald-500",
                          sign < 0 && "text-red-600 dark:text-red-500"
                        )}
                      >
                        {sign > 0 ? "+" : sign < 0 ? "−" : ""}
                        {formatGs(t.amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground tabular-nums">
          {total === 0 ? "Sin transacciones" : `Mostrando ${from}–${to} de ${total}`}
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
            onClick={() => onPage(Math.max(0, page - 1))}
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount - 1 || pending}
            onClick={() => onPage(page + 1)}
          >
            Siguiente
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
