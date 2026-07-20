import { BANNER_STATUS } from "@/config/banners"
import type { BannerComputedStatus } from "@/lib/banners/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Muestra el estado *calculado* (isActive + ventana startsAt/endsAt), no el
 * toggle puro. Ver computeBannerStatus en lib/banners/status.ts.
 */
export function BannerStatusBadge({
  status,
  className,
}: {
  status: BannerComputedStatus
  className?: string
}) {
  const meta = BANNER_STATUS[status]
  return (
    <Badge
      variant="outline"
      title={meta.description}
      className={cn("gap-1.5 font-medium", meta.className, className)}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {meta.label}
    </Badge>
  )
}
