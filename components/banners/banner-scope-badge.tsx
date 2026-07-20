import { Globe, Store } from "lucide-react"

import { BANNER_SCOPE } from "@/config/banners"
import type { Banner } from "@/lib/banners/types"
import { bannerScope } from "@/lib/banners/status"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Distingue banners GLOBAL (barId null) de LOCAL (bar específico).
 * En los locales muestra el nombre del bar dueño.
 */
export function BannerScopeBadge({ banner }: { banner: Banner }) {
  const scope = bannerScope(banner)
  const meta = BANNER_SCOPE[scope]
  const Icon = scope === "global" ? Globe : Store
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={cn("gap-1.5 font-medium", meta.className)}>
        <Icon className="size-3" />
        {meta.label}
      </Badge>
      {scope === "local" && banner.bar && (
        <span className="truncate text-xs text-muted-foreground">
          {banner.bar.name}
        </span>
      )}
    </div>
  )
}
