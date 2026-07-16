import { getStaffBars, getStaffPage, getStaffSummary } from "@/lib/staff/api"
import { DEFAULT_STAFF_QUERY } from "@/lib/staff/types"
import { STAFF_PAGE_SIZE } from "@/config/staff"
import { StaffKpis } from "@/components/staff/staff-kpis"
import { StaffManager } from "@/components/staff/staff-manager"

export default async function MozosPage() {
  const [page, summary, bars] = await Promise.all([
    getStaffPage(DEFAULT_STAFF_QUERY, STAFF_PAGE_SIZE, 0),
    getStaffSummary(),
    getStaffBars(),
  ])

  return (
    <>
      <StaffKpis summary={summary} />
      <StaffManager
        initialData={page.data}
        initialTotal={page.total}
        bars={bars}
      />
    </>
  )
}
