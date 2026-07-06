import { getStaff, getStaffBars } from "@/lib/staff/api"
import { StaffKpis } from "@/components/staff/staff-kpis"
import { StaffManager } from "@/components/staff/staff-manager"

export default async function MozosPage() {
  const [staff, bars] = await Promise.all([getStaff(), getStaffBars()])

  return (
    <>
      <StaffKpis staff={staff} />
      <StaffManager staff={staff} bars={bars} />
    </>
  )
}
