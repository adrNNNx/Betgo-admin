import { Dice5, Trophy, Wallet, Plus, Minus, TriangleAlert } from "lucide-react"

import type { PoolMovement } from "@/lib/pozo/types"
import { jackpotMovementView, type JackpotTone } from "@/lib/pozo/jackpots"
import { cn } from "@/lib/utils"

const BASE =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold whitespace-nowrap [&_svg]:size-3"

/** Un pendiente es plata adeudada: no puede verse igual que uno ya cerrado. */
const TONE_CLASS: Record<JackpotTone, string> = {
  paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  legacy: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-500",
}

/**
 * Badge del tipo de movimiento. Los ajustes se dividen visualmente en suma
 * (verde) y resta (rojo) según el signo del impacto en el pozo.
 *
 * Los pozos ganados se rotulan según el estado del pago: el movimiento se
 * registra al ganarse, no al cobrarse.
 */
export function MovementTypeBadge({ movement }: { movement: PoolMovement }) {
  if (movement.type === "adjust") {
    const add = movement.poolDelta >= 0
    return (
      <span
        className={cn(
          BASE,
          add
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
            : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
        )}
      >
        {/* El signo lo dice el ícono: repetirlo en el texto daba "− Ajuste −". */}
        {add ? <Plus /> : <Minus />}
        Ajuste
      </span>
    )
  }

  if (movement.type === "payout") {
    const { label, tone } = jackpotMovementView(movement.jackpot)
    return (
      <span className={cn(BASE, TONE_CLASS[tone])}>
        {tone === "pending" ? <TriangleAlert /> : <Trophy />}
        {label}
      </span>
    )
  }

  const map = {
    game_spin: { icon: <Dice5 />, label: "Jugada", cls: "bg-secondary text-muted-foreground" },
    topup: { icon: <Wallet />, label: "Recarga", cls: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
  } as const

  const t = map[movement.type]
  return (
    <span className={cn(BASE, t.cls)}>
      {t.icon}
      {t.label}
    </span>
  )
}
