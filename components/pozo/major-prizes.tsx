"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Trophy,
  TriangleAlert,
} from "lucide-react"

import type { BarRef } from "@/lib/staff/types"
import type { ClaimStatus, MajorClaim } from "@/lib/pozo/types"
import {
  CLAIM_PAGE_SIZE,
  STATUS_FILTERS,
  canDeliver,
  expiryLabel,
  matchesQuery,
  urgencyOf,
  type Urgency,
} from "@/lib/pozo/claims"
import { fetchMajorClaims } from "@/lib/pozo/actions"
import { formatDateTime } from "@/lib/pozo/format"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DeliverMajorDialog } from "@/components/pozo/dialogs/deliver-major-dialog"
import { cn } from "@/lib/utils"

const URGENCY_CLASS: Record<Urgency, string> = {
  vencido: "text-red-600 dark:text-red-400",
  urgente: "text-red-600 font-semibold dark:text-red-400",
  pronto: "text-amber-600 font-semibold dark:text-amber-500",
  normal: "text-muted-foreground",
}

/**
 * Premios mayores: los `type: jackpot` del catálogo (iPhone, montos grandes).
 * El mozo los tiene filtrados, los autoriza un admin desde acá.
 *
 * NO es ganar el pozo global: eso se acredita solo al saldo y no genera
 * comprobante. Viven en esta pantalla porque son el circuito de premios grandes
 * que el admin ya está mirando cuando administra el pozo.
 *
 * El estado y el bar se filtran en el backend (la lista puede crecer sin techo);
 * la búsqueda por código es sobre la página cargada, que es el caso real: el
 * jugador aparece con el papel en la mano y el comprobante está entre los
 * pendientes.
 */
export function MajorPrizes({
  initialData,
  initialTotal,
  bars,
}: {
  initialData: MajorClaim[]
  initialTotal: number
  bars: BarRef[]
}) {
  const [status, setStatus] = useState<ClaimStatus>("pending")
  const [barId, setBarId] = useState("all")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(0)
  const [data, setData] = useState(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [delivering, setDelivering] = useState<MajorClaim | null>(null)
  const [refresh, setRefresh] = useState(0)
  const [pending, startTransition] = useTransition()
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    startTransition(async () => {
      const res = await fetchMajorClaims({
        status,
        barId: barId === "all" ? undefined : barId,
        limit: CLAIM_PAGE_SIZE,
        offset: page * CLAIM_PAGE_SIZE,
      })
      setData(res.data)
      setTotal(res.total)
    })
  }, [status, barId, page, refresh])

  // Ordenamos por vencimiento: lo que está por caducar primero, que es lo que
  // el admin tiene que resolver hoy. El backend ordena por fecha de emisión.
  const visible = useMemo(() => {
    const list = data.filter((c) => matchesQuery(c, query))
    if (status !== "pending") return list
    return [...list].sort(
      (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
    )
  }, [data, query, status])

  const urgentCount = useMemo(
    () =>
      status === "pending"
        ? data.filter((c) => {
            const u = urgencyOf(c.expiresAt)
            return u === "urgente" || u === "pronto"
          }).length
        : 0,
    [data, status]
  )

  const pageCount = Math.max(1, Math.ceil(total / CLAIM_PAGE_SIZE))
  const from = total === 0 ? 0 : page * CLAIM_PAGE_SIZE + 1
  const to = Math.min(total, (page + 1) * CLAIM_PAGE_SIZE)

  const reset = () => setPage(0)

  return (
    <>
      <Card className="py-0">
        <CardHeader className="flex-row items-start gap-4 border-b py-5">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-4 text-muted-foreground" />
              Premios mayores
            </CardTitle>
            <CardDescription>
              Comprobantes de premios grandes (celulares, autos, montos) que sólo
              un administrador puede entregar. El mozo no los ve en su panel.
            </CardDescription>
          </div>
          <span className="ml-auto shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {total} {total === 1 ? "comprobante" : "comprobantes"}
          </span>
        </CardHeader>

        {urgentCount > 0 && (
          <p className="flex items-start gap-2.5 border-b bg-amber-50 px-6 py-3 text-[13px] text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <TriangleAlert className="mt-px size-4 shrink-0" />
            <span>
              <strong>
                {urgentCount} {urgentCount === 1 ? "comprobante vence" : "comprobantes vencen"}
              </strong>{" "}
              en los próximos días. Una vez vencidos no se pueden entregar ni
              reactivar desde el panel.
            </span>
          </p>
        )}

        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 border-b px-6 py-3.5">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por código, jugador o premio…"
              className="pl-8 font-mono text-sm"
            />
          </div>

          <Select
            value={barId}
            onValueChange={(v) => {
              setBarId(v)
              reset()
            }}
          >
            <SelectTrigger size="sm" className="w-[190px]">
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

          <ToggleGroup
            type="single"
            value={status}
            onValueChange={(v) => {
              if (!v) return
              setStatus(v as ClaimStatus)
              reset()
            }}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            {STATUS_FILTERS.map((f) => (
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
                  <TableHead>Código</TableHead>
                  <TableHead>Premio</TableHead>
                  <TableHead>Jugador</TableHead>
                  <TableHead>Bar</TableHead>
                  <TableHead>Emitido</TableHead>
                  <TableHead>Vencimiento</TableHead>
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
                        ? `Ningún comprobante coincide con “${query}”.`
                        : status === "pending"
                          ? "No hay premios mayores pendientes de entrega."
                          : status === "delivered"
                            ? "Todavía no se entregó ningún premio mayor."
                            : "No hay comprobantes vencidos."}
                    </TableCell>
                  </TableRow>
                ) : (
                  visible.map((c) => {
                    const urgency = urgencyOf(c.expiresAt)
                    const entregable = canDeliver(c, status)
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-[13px] font-semibold">
                          {c.claimCode}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate font-medium">
                          {c.prizeName}
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
                          {formatDateTime(c.createdAt).date}
                        </TableCell>
                        <TableCell>
                          <div className={cn("text-[13px]", URGENCY_CLASS[urgency])}>
                            {expiryLabel(c.expiresAt)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDateTime(c.expiresAt).date}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {entregable ? (
                            <Button size="sm" onClick={() => setDelivering(c)}>
                              Entregar
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {status === "delivered" ? "Entregado" : "Vencido"}
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

          {total > CLAIM_PAGE_SIZE && (
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

      {/* key → notas limpias en cada comprobante, sin resetear a mano */}
      {delivering && (
        <DeliverMajorDialog
          key={delivering.id}
          claim={delivering}
          onClose={() => setDelivering(null)}
          onDelivered={() => setRefresh((k) => k + 1)}
        />
      )}
    </>
  )
}
