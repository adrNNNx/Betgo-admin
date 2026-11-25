"use client"

import { useState, useTransition } from "react"
import { AlertTriangle, Phone, RotateCcw, Store } from "lucide-react"

import type { BarDailyPlays } from "@/lib/jugadas/types"
import { displayName, formatPlayDate, playsLabel } from "@/lib/jugadas/format"
import { RESET_REASON_MAX, RESET_REASON_PRESETS } from "@/config/jugadas"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type ResetTarget =
  | { scope: "bar"; bar: BarDailyPlays }
  | { scope: "all"; bars: BarDailyPlays[]; plays: number }

/**
 * Confirmación del reinicio. Dice exactamente qué va a pasar —jugador con su
 * teléfono, alcance y cantidad— para que un admin con dos jugadores de nombre
 * parecido en pantalla se dé cuenta antes de confirmar. El motivo se pide
 * siempre: queda en la auditoría.
 *
 * El llamador lo remonta con un `key` nuevo en cada apertura, así el motivo
 * arranca vacío sin un efecto que lo limpie.
 */
export function ResetPlaysDialog({
  open,
  player,
  playDate,
  target,
  onClose,
  onConfirm,
}: {
  open: boolean
  player: { name: string | null; phone: string }
  playDate: string
  target: ResetTarget | null
  onClose: () => void
  /** Devuelve true si salió bien (cierra el diálogo); false lo deja abierto. */
  onConfirm: (reason: string) => Promise<boolean>
}) {
  const [reason, setReason] = useState("")
  const [touched, setTouched] = useState(false)
  const [pending, startTransition] = useTransition()

  if (!target) return null

  const all = target.scope === "all"
  const plays = all ? target.plays : target.bar.playsUsed
  const trimmed = reason.trim()
  const invalid = trimmed.length === 0 || reason.length > RESET_REASON_MAX
  const name = displayName(player.name)

  const submit = () => {
    setTouched(true)
    if (invalid || pending) return
    startTransition(async () => {
      if (await onConfirm(trimmed)) onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !pending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-md",
                all
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                  : "bg-secondary text-foreground"
              )}
            >
              {all ? <AlertTriangle className="size-5" /> : <RotateCcw className="size-5" />}
            </span>
            <div className="space-y-1">
              <DialogTitle>
                {all ? "Devolver jugadas en TODOS los bares" : "Devolver jugadas"}
              </DialogTitle>
              <DialogDescription>
                Sólo afecta las jugadas de hoy, {formatPlayDate(playDate)}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
          <dt className="text-muted-foreground">Jugador</dt>
          <dd className="font-semibold">{name}</dd>
          <dt className="text-muted-foreground">Teléfono</dt>
          <dd className="inline-flex items-center gap-1.5 font-mono">
            <Phone className="size-3.5 text-muted-foreground" />
            {player.phone}
          </dd>
          <dt className="text-muted-foreground">Alcance</dt>
          <dd className={cn(all && "font-semibold text-amber-700 dark:text-amber-400")}>
            {all ? `Todos los bares (${target.bars.length})` : target.bar.barName}
          </dd>
          <dt className="text-muted-foreground">Se devuelven</dt>
          <dd className="font-semibold tabular-nums">{playsLabel(plays)}</dd>
        </dl>

        {all && (
          <ul className="space-y-1 text-sm">
            {target.bars.map((b) => (
              <li key={b.barId} className="flex items-center gap-2">
                <Store className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">{b.barName}</span>
                <span className="tabular-nums text-muted-foreground">
                  {b.playsUsed > 0 ? `${playsLabel(b.playsUsed)}` : "nada que devolver"}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-muted-foreground">
          El jugador vuelve a tener su cupo diario completo, sin jugadas extra.
          Queda registrado en la auditoría con tu usuario.
        </p>

        <div className="grid gap-2">
          <Label htmlFor="reset-reason">Motivo</Label>
          <Textarea
            id="reset-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Ej. Se cayó la red del bar a mitad del giro"
            maxLength={RESET_REASON_MAX}
            aria-invalid={touched && invalid}
            rows={2}
            disabled={pending}
          />
          <div className="flex flex-wrap items-center gap-1.5">
            {RESET_REASON_PRESETS.map((r) => (
              <Button
                key={r}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  setReason(r)
                  setTouched(true)
                }}
                disabled={pending}
              >
                {r}
              </Button>
            ))}
            <span className="ml-auto text-xs tabular-nums text-muted-foreground">
              {reason.length}/{RESET_REASON_MAX}
            </span>
          </div>
          {touched && trimmed.length === 0 && (
            <p className="text-xs text-destructive">Contá brevemente por qué se devuelven.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={pending || (touched && invalid)}>
            <RotateCcw />
            {pending
              ? "Devolviendo…"
              : all
                ? `Devolver ${playsLabel(plays)} en todos`
                : `Devolver ${playsLabel(plays)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
