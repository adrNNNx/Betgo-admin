import { BAR_STATUS } from "@/config/bares"
import type { BarStatus } from "@/lib/bares/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function BarStatusBadge({ status }: { status: BarStatus }) {
  const meta = BAR_STATUS[status]
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", meta.className)}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {meta.label}
    </Badge>
  )
}
