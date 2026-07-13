"use server"

import {
  getPlayerHistory,
  getTransactionsPage,
  getTransactionsSummary,
} from "@/lib/transacciones/api"
import type {
  Transaction,
  TransactionFilters,
  TransactionSummary,
} from "@/lib/transacciones/types"

export type TransactionsQueryResult = {
  data: Transaction[]
  total: number
  summary: TransactionSummary
}

/** Trae lista paginada + resumen del conjunto filtrado en una sola llamada. */
export async function queryTransactions(
  filters: TransactionFilters,
  offset: number,
  limit: number
): Promise<TransactionsQueryResult> {
  const [page, summary] = await Promise.all([
    getTransactionsPage(filters, limit, offset),
    getTransactionsSummary(filters),
  ])
  return { data: page.data, total: page.total, summary }
}

/** Últimas transacciones de un jugador (para el drawer de detalle). */
export async function fetchPlayerHistory(
  playerId: string
): Promise<Transaction[]> {
  return getPlayerHistory(playerId, 8)
}
