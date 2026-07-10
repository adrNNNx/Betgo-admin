import {
  getGlobalPrizes,
  getGlobalSymbols,
  getMovementsPage,
  getPoolState,
} from "@/lib/pozo/api"
import { HISTORY_PAGE_SIZE } from "@/config/pozo"
import { PozoGlobal } from "@/components/pozo/pozo-global"

export default async function PozoPage() {
  const [pool, movements, symbols, prizes] = await Promise.all([
    getPoolState(),
    getMovementsPage({ limit: HISTORY_PAGE_SIZE, offset: 0 }),
    getGlobalSymbols(),
    getGlobalPrizes(),
  ])

  return (
    <div
      data-screen-label="Pozo global"
      className="mx-auto flex w-full max-w-[1200px] flex-col gap-6"
    >
      <PozoGlobal
        pool={pool}
        movements={movements.data}
        movementsTotal={movements.total}
        symbols={symbols}
        prizes={prizes}
      />
    </div>
  )
}
