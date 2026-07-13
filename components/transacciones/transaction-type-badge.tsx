import type { TransactionCategory } from "@/lib/transacciones/types"
import { CATEGORY_META } from "@/lib/transacciones/utils"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function TransactionTypeBadge({
  category,
}: {
  category: TransactionCategory
}) {
  const meta = CATEGORY_META[category]
  const Icon = meta.icon
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 border-transparent font-medium", meta.badgeClass)}
    >
      <Icon className="size-3" />
      {meta.label}
    </Badge>
  )
}
