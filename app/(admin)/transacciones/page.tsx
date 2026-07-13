import {
  getBarOptions,
  getTransactionsPage,
  getTransactionsSummary,
} from "@/lib/transacciones/api"
import { DEFAULT_FILTERS } from "@/lib/transacciones/types"
import { TX_PAGE_SIZE } from "@/config/transacciones"
import { TransaccionesScreen } from "@/components/transacciones/transacciones-screen"

export default async function TransaccionesPage() {
  const [page, summary, bars] = await Promise.all([
    getTransactionsPage(DEFAULT_FILTERS, TX_PAGE_SIZE, 0),
    getTransactionsSummary(DEFAULT_FILTERS),
    getBarOptions(),
  ])

  return (
    <TransaccionesScreen
      initialData={page.data}
      initialTotal={page.total}
      initialSummary={summary}
      bars={bars}
    />
  )
}
