import type { TransactionCategory } from "@/lib/transacciones/types"

export const CATEGORY_FILTERS: {
  value: TransactionCategory | "all"
  label: string
}[] = [
  { value: "all", label: "Todas" },
  { value: "play", label: "Jugadas" },
  { value: "recharge", label: "Recargas" },
  { value: "prize", label: "Premios" },
  { value: "revenue", label: "Ingreso empresa" },
  { value: "adjust", label: "Ajustes" },
]

/** Filas por página en la tabla de transacciones. */
export const TX_PAGE_SIZE = 50
