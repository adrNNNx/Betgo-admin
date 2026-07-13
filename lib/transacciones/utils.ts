import {
  Building2,
  Dice5,
  Diff,
  Trophy,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import type {
  Transaction,
  TransactionCategory,
  TransactionType,
} from "@/lib/transacciones/types"

/** Mapea el tipo crudo del backend a una categoría legible. */
export function categoryOf(type: TransactionType): TransactionCategory {
  switch (type) {
    case "play_free":
    case "play_paid":
    case "play_pool":
      return "play"
    case "recharge":
    case "bar_recharge":
      return "recharge"
    case "prize_local":
    case "prize_jackpot":
      return "prize"
    case "platform_revenue":
      return "revenue"
    case "adjustment":
      return "adjust"
  }
}

type CategoryMeta = {
  label: string
  icon: LucideIcon
  /** clases del badge (soporta dark mode) */
  badgeClass: string
  /** dirección del dinero para el color del monto */
  sign: 1 | -1 | 0
}

export const CATEGORY_META: Record<TransactionCategory, CategoryMeta> = {
  play: {
    label: "Jugada",
    icon: Dice5,
    badgeClass: "bg-secondary text-muted-foreground",
    sign: 0,
  },
  recharge: {
    label: "Recarga",
    icon: Wallet,
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    sign: 1,
  },
  prize: {
    label: "Premio",
    icon: Trophy,
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-500",
    sign: -1,
  },
  revenue: {
    label: "Ingreso empresa",
    icon: Building2,
    badgeClass:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    sign: 1,
  },
  adjust: {
    label: "Ajuste",
    icon: Diff,
    badgeClass:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
    sign: 0,
  },
}

/** Etiqueta del método de pago del backend. */
const METHOD_LABELS: Record<string, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  qr: "QR",
  card: "Tarjeta",
  other: "Otro",
}
export function methodLabel(m: string | null): string {
  if (!m) return "—"
  return METHOD_LABELS[m] ?? m
}

/** Efecto del monto (para color/signo): -1 egreso, +1 ingreso, 0 neutro. */
export function txSign(t: Transaction): 1 | -1 | 0 {
  return CATEGORY_META[t.category].sign
}

// --- Formato (es-PY / Guaraníes) ------------------------------------------

export function formatGs(value: number): string {
  return "Gs. " + Math.abs(Math.round(value)).toLocaleString("es-PY")
}

const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
]
const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"]

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}
export function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}
export function formatDateLong(iso: string): string {
  const d = new Date(iso)
  return `${DIAS[d.getDay()]}, ${formatDate(iso)} · ${formatTime(iso)}`
}
