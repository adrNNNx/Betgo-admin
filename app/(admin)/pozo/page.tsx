import {
  getGlobalPrizes,
  getGlobalSymbols,
  getMajorClaims,
  getMovementsPage,
  getPoolState,
} from "@/lib/pozo/api"
import { getStaffBars } from "@/lib/staff/api"
import { HISTORY_PAGE_SIZE } from "@/config/pozo"
import { CLAIM_PAGE_SIZE } from "@/lib/pozo/claims"
import { PozoGlobal } from "@/components/pozo/pozo-global"

export default async function PozoPage() {
  const [pool, movements, symbols, prizes, major, bars] = await Promise.all([
    getPoolState(),
    getMovementsPage({ limit: HISTORY_PAGE_SIZE, offset: 0 }),
    getGlobalSymbols(),
    getGlobalPrizes(),
    // Pendientes: es lo que el admin tiene que resolver al entrar.
    getMajorClaims({ status: "pending", limit: CLAIM_PAGE_SIZE, offset: 0 }),
    getStaffBars(),
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
        majorClaims={major.data}
        majorClaimsTotal={major.total}
        bars={bars}
      />
    </div>
  )
}
