import { AlertTriangle, Infinity as InfinityIcon, Package, Trophy, XCircle } from "lucide-react"

import type { Prize, PrizeStatus, PrizeType, Scope, SlotSymbol } from "@/lib/premios/types"
import { isImageSrc, stockInfo, type StockLevel } from "@/lib/premios/helpers"
import { formatGs } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function TipoBadge({ type }: { type: PrizeType }) {
  return type === "jackpot" ? (
    <Badge
      variant="outline"
      className="gap-1 border-transparent bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-500"
    >
      <Trophy className="size-3" />
      Jackpot
    </Badge>
  ) : (
    <Badge variant="outline" className="border-transparent bg-secondary text-muted-foreground">
      Local
    </Badge>
  )
}

const STOCK_ICON = { inf: InfinityIcon, out: XCircle, low: AlertTriangle, ok: Package }
const STOCK_CLASS: Record<StockLevel, string> = {
  inf: "bg-secondary text-muted-foreground",
  ok: "bg-secondary text-muted-foreground",
  low: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-500",
  out: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
}

export function StockBadge({ prize }: { prize: Prize }) {
  const info = stockInfo(prize)
  const Icon = STOCK_ICON[info.level]
  return (
    <Badge variant="outline" className={cn("gap-1 border-transparent", STOCK_CLASS[info.level])}>
      <Icon className="size-3" />
      {info.label}
    </Badge>
  )
}

export function PrizeStatusBadge({ status }: { status: PrizeStatus }) {
  return status === "active" ? (
    <Badge
      variant="outline"
      className="gap-1.5 border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      Activo
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1.5 border-transparent bg-muted text-muted-foreground">
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      Inactivo
    </Badge>
  )
}

export function Money({ value }: { value: number | null }) {
  if (!value) return <span className="text-muted-foreground">—</span>
  return <span className="tabular-nums">{formatGs(value)}</span>
}

const SCOPE_STOP = new Set([
  "bar", "&", "the", "el", "la", "los", "las", "de", "pub", "club",
])

/** Iniciales de un ámbito, ignorando palabras genéricas. */
export function scopeInitials(name: string): string {
  const all = name.split(/\s+/).filter(Boolean)
  const sig = all.filter(
    (w) => !SCOPE_STOP.has(w.toLowerCase().replace(/[^a-záéíóúñ0-9]/gi, ""))
  )
  const pick = sig.length ? sig : all
  return ((pick[0]?.[0] ?? "") + (pick[1]?.[0] ?? pick[0]?.[1] ?? "")).toUpperCase()
}

/**
 * Avatar de un ámbito: el logo del bar si está disponible; si no, el trofeo
 * (pozo global) o las iniciales sobre un color. Mismo criterio que en Bares.
 */
export function ScopeAvatar({
  scope,
  color,
  className,
}: {
  scope: Scope
  color: string
  className?: string
}) {
  const box = cn("grid size-[30px] flex-none place-items-center rounded-sm", className)
  if (scope.imageUrl) {
    return (
      <span className={cn(box, "overflow-hidden bg-secondary")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={scope.imageUrl} alt={scope.name} className="size-full object-cover" />
      </span>
    )
  }
  return (
    <span
      className={cn(box, "text-[11px] font-bold tracking-wide text-white")}
      style={{ background: color }}
    >
      {scope.type === "global" ? <Trophy className="size-4" /> : scopeInitials(scope.name)}
    </span>
  )
}

/** Miniatura de un símbolo: imagen propia o emoji. */
export function SymbolThumb({
  symbol,
  className,
}: {
  symbol: SlotSymbol
  className?: string
}) {
  return (
    <span
      className={cn(
        "grid place-items-center overflow-hidden rounded-md bg-secondary leading-none",
        className
      )}
    >
      {isImageSrc(symbol.emoji) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={symbol.emoji} alt={symbol.name} className="size-full object-cover" />
      ) : (
        symbol.emoji
      )}
    </span>
  )
}
