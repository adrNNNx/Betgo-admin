"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { ChevronLeft, ChevronRight, Search, Trophy } from "lucide-react"

import type { JackpotClaim, JackpotPendingCount } from "@/lib/pozo/types"
import {
  JACKPOT_PAGE_SIZE,
  JACKPOT_VIEWS,
  STATUS_META,
  byUrgency,
  canPay,
  matchesFolio,
  statusForView,
  type JackpotView,
} from "@/lib/pozo/jackpots"
import { fetchJackpotClaims } from "@/lib/pozo/actions"
import { formatGs } from "@/lib/format"
import { formatDateTime } from "@/lib/pozo/format"
import { Badge } from "@/components/ui/badge"
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
import { PayJackpotDialog } from "@/components/pozo/dialogs/pay-jackpot-dialog"
import { cn } from "@/lib/utils"

/**
 * Pozos ganados esperando pago manual.
 *
 * El pozo global ya no se acredita al saldo: se emite un folio y administración
 * transfiere. Sin esta pantalla el circuito no cierra — es plata que la empresa
 * adeuda y no habría forma de verla ni de saldarla.
 *
 * Arranca en "Pendientes" (sin contactar + en revisión) porque es lo que falta
 * resolver; los pagados son historial.
 */
export function WonJackpots({
  initialData,
  initialTotal,
  count,
}: {
  initialData: JackpotClaim[]
  initialTotal: number
  count: JackpotPendingCount
}) {
  const [view, setView] = useState<JackpotView>("pending")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(0)
  const [data, setData] = useState(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [paying, setPaying] = useState<JackpotClaim | null>(null)
  const [refresh, setRefresh] = useState(0)
  const [pending, startTransition] = useTransition()
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    startTransition(async () => {
      const res = await fetchJackpotClaims({
        status: statusForView(view),
        limit: JACKPOT_PAGE_SIZE,
        offset: page * JACKPOT_PAGE_SIZE,
      })
      setData(res.data)
      setTotal(res.total)
    })
  }, [view, page, refresh])

  const visible = useMemo(
    () => data.filter((c) => matchesFolio(c, query)).sort(byUrgency),
    [data, query]
  )

  const pageCount = Math.max(1, Math.ceil(total / JACKPOT_PAGE_SIZE))
  const from = total === 0 ? 0 : page * JACKPOT_PAGE_SIZE + 1
  const to = Math.min(total, (page + 1) * JACKPOT_PAGE_SIZE)

  return (
    <>
      <Card className="py-0">
        <CardHeader className="flex-row items-start gap-4 border-b py-5">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-4 text-muted-foreground" />
              Pozos ganados
            </CardTitle>
            <CardDescription>
              El pozo no se acredita al saldo: se emite un folio y se paga por
              transferencia. Acá se marca cada uno como pagado.
            </CardDescription>
          </div>
        </CardHeader>

        {/* La deuda viva es el número que le importa a quien administra. */}
        <div className="flex flex-wrap gap-x-8 gap-y-3 border-b bg-secondary/40 px-6 py-4">
          <Summary
            label="Deuda pendiente"
            value={formatGs(count.amountOwed)}
            className={count.amountOwed > 0 ? "text-amber-600 dark:text-amber-500" : undefined}
          />
          <Summary
            label="Esperando pago"
            value={`${count.inReview}`}
            hint="ya escribieron"
            className={count.inReview > 0 ? "text-amber-600 dark:text-amber-500" : undefined}
          />
          <Summary
            label="Sin contactar"
            value={`${count.pendingContact}`}
            hint="todavía no escribieron"
          />
        </div>

        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 border-b px-6 py-3.5">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar folio, ganador o teléfono…"
              className="pl-8 font-mono text-sm"
            />
          </div>

          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => {
              if (!v) return
              setView(v as JackpotView)
              setPage(0)
            }}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            {JACKPOT_VIEWS.map((f) => (
              <ToggleGroupItem key={f.value} value={f.value}>
                {f.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <CardContent className="px-0 pb-0">
          <div
            className={cn(
              "max-h-[520px] overflow-auto transition-opacity",
              pending && "pointer-events-none opacity-60"
            )}
            aria-busy={pending}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Folio</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Ganador</TableHead>
                  <TableHead>Bar</TableHead>
                  <TableHead>Ganado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      {query
                        ? `Ningún pozo coincide con “${query}”.`
                        : view === "paid"
                          ? "Todavía no se pagó ningún pozo."
                          : "No hay pozos pendientes de pago."}
                    </TableCell>
                  </TableRow>
                ) : (
                  visible.map((c) => {
                    const meta = STATUS_META[c.status]
                    return (
                      <TableRow
                        key={c.id}
                        className={cn(meta.needsAction && "bg-amber-50/40 dark:bg-amber-950/10")}
                      >
                        <TableCell className="font-mono text-[13px] font-semibold">
                          {c.folio}
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {formatGs(c.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {c.playerName ?? "Sin nombre"}
                          </div>
                          <div className="text-xs tabular-nums text-muted-foreground">
                            {c.playerPhone ?? "—"}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.barName ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDateTime(c.playedAt).date}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={meta.className}>
                            {meta.label}
                          </Badge>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {c.status === "paid" && c.paidAt
                              ? formatDateTime(c.paidAt).date
                              : meta.hint}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {canPay(c) ? (
                            <Button
                              size="sm"
                              variant={meta.needsAction ? "default" : "outline"}
                              onClick={() => setPaying(c)}
                            >
                              Marcar pagado
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Pagado
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {total > JACKPOT_PAGE_SIZE && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-3.5">
              <span className="text-xs tabular-nums text-muted-foreground">
                Mostrando {from}–{to} de {total}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs tabular-nums text-muted-foreground">
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
          )}
        </CardContent>
      </Card>

      {paying && (
        <PayJackpotDialog
          key={paying.id}
          claim={paying}
          onClose={() => setPaying(null)}
          onPaid={() => setRefresh((k) => k + 1)}
        />
      )}
    </>
  )
}

function Summary({
  label,
  value,
  hint,
  className,
}: {
  label: string
  value: string
  hint?: string
  className?: string
}) {
  return (
    <div className="space-y-0.5">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={cn("text-sm font-semibold", className)}>{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  )
}
