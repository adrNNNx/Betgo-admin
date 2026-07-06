import { STAFF_STATUS } from "@/config/staff"
import type { StaffStatus } from "@/lib/staff/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function StaffStatusBadge({ status }: { status: StaffStatus }) {
  const meta = STAFF_STATUS[status]
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", meta.className)}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {meta.label}
    </Badge>
  )
}
