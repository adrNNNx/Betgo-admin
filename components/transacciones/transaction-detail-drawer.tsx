"use client"

import { useEffect, useState, useTransition } from "react"
import { Check, Copy } from "lucide-react"

import type { Transaction } from "@/lib/transacciones/types"
import { fetchPlayerHistory } from "@/lib/transacciones/actions"
import {
  formatDate,
  formatDateLong,
  formatGs,
  formatTime,
  methodLabel,
  txSign,
} from "@/lib/transacciones/utils"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { TransactionTypeBadge } from "@/components/transacciones/transaction-type-badge"
import { cn } from "@/lib/utils"

export function TransactionDetailDrawer({
  tx,
  onClose,
}: {
  tx: Transaction | null
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<Transaction[]>([])
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (!tx?.playerId) {
      setHistory([])
      return
    }
    const playerId = tx.playerId
    startTransition(async () => {
      setHistory(await fetchPlayerHistory(playerId))
    })
  }, [tx?.playerId])

  const sign = tx ? txSign(tx) : 0

  const copyPlayer = async () => {
    if (!tx?.playerId) return
    try {
      await navigator.clipboard.writeText(tx.playerId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard no disponible */
    }
  }

  return (
    <Sheet open={Boolean(tx)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        {tx && (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-center gap-2">
                <TransactionTypeBadge category={tx.category} />
                <span className="font-mono text-xs text-muted-foreground">{tx.ref}</span>
              </div>
              <SheetTitle
                className={cn(
                  "text-2xl tabular-nums",
                  sign > 0 && "text-emerald-600 dark:text-emerald-500",
                  sign < 0 && "text-red-600 dark:text-red-500"
                )}
              >
                {sign > 0 ? "+" : sign < 0 ? "−" : ""}
                {formatGs(tx.amount)}
              </SheetTitle>
              <SheetDescription>{formatDateLong(tx.timestamp)}</SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto">
              {/* detalle */}
              <div className="grid gap-3 p-4">
                <Detail label="Bar" value={tx.barName ?? "—"} />
                <Detail label="Mozo" value={tx.mozoName ?? "—"} />
                <Detail label="Método" value={methodLabel(tx.method)} />
                {tx.balanceBefore !== null && (
                  <Detail label="Saldo previo" value={formatGs(tx.balanceBefore)} />
                )}
                {tx.balanceAfter !== null && (
                  <Detail label="Saldo posterior" value={formatGs(tx.balanceAfter)} />
                )}
                {tx.note && <Detail label="Nota" value={tx.note} />}

                <div className="grid gap-1">
                  <span className="text-xs text-muted-foreground">Jugador</span>
                  <div className="flex items-center gap-2">
                    <code className="truncate rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-xs">
                      {tx.playerName ?? tx.playerId ?? "—"}
                    </code>
                    {tx.playerId && (
                      <button
                        type="button"
                        onClick={copyPlayer}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        title="Copiar ID"
                      >
                        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* historial del jugador */}
              {tx.playerId && (
                <div className="border-t p-4">
                  <h4 className="mb-2 text-sm font-semibold">Actividad del jugador</h4>
                  {history.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Sin actividad reciente para mostrar.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {history.map((h) => {
                        const hs = txSign(h)
                        return (
                          <div
                            key={h.id}
                            className="flex items-center gap-2 rounded-md border px-2.5 py-1.5"
                          >
                            <TransactionTypeBadge category={h.category} />
                            <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
                              {formatDate(h.timestamp)} {formatTime(h.timestamp)}
                            </span>
                            <span
                              className={cn(
                                "text-xs font-semibold tabular-nums",
                                hs > 0 && "text-emerald-600 dark:text-emerald-500",
                                hs < 0 && "text-red-600 dark:text-red-500"
                              )}
                            >
                              {hs > 0 ? "+" : hs < 0 ? "−" : ""}
                              {formatGs(h.amount)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}
