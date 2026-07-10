import { Dice5, Trophy, Wallet, Plus, Minus } from "lucide-react"

import type { PoolMovement } from "@/lib/pozo/types"
import { cn } from "@/lib/utils"

/**
 * Badge del tipo de movimiento. Los ajustes se dividen visualmente en suma
 * (verde) y resta (rojo) según el signo del impacto en el pozo.
 */
export function MovementTypeBadge({ movement }: { movement: PoolMovement }) {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold whitespace-nowrap [&_svg]:size-3"

  if (movement.type === "adjust") {
    const add = movement.poolDelta >= 0
    return (
      <span
        className={cn(
          base,
          add
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
            : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
        )}
      >
        {add ? <Plus /> : <Minus />}
        {add ? "Ajuste +" : "Ajuste −"}
      </span>
    )
  }

  const map = {
    game_spin: { icon: <Dice5 />, label: "Jugada", cls: "bg-secondary text-muted-foreground" },
    topup: { icon: <Wallet />, label: "Recarga", cls: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
    payout: { icon: <Trophy />, label: "Pago", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-500" },
  } as const

  const t = map[movement.type]
  return (
    <span className={cn(base, t.cls)}>
      {t.icon}
      {t.label}
    </span>
  )
}
