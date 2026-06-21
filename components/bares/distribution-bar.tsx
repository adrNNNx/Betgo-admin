import { DISTRIBUTION_COLORS } from "@/config/bares"
import type { Distribution } from "@/lib/bares/types"
import { cn } from "@/lib/utils"

/** Barra de 3 segmentos + leyenda para Bar / Pozo / Empresa. */
export function DistributionBar({ value }: { value: Distribution }) {
  const segments = [
    { key: "bar", label: "Bar", pct: value.bar, color: DISTRIBUTION_COLORS.bar },
    { key: "pozo", label: "Pozo", pct: value.pozo, color: DISTRIBUTION_COLORS.pozo },
    { key: "empresa", label: "Emp", pct: value.empresa, color: DISTRIBUTION_COLORS.empresa },
  ]

  return (
    <div className="w-[170px]">
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
        {segments.map((s) => (
          <span
            key={s.key}
            className={cn("h-full rounded-sm", s.color)}
            style={{ width: `${s.pct}%` }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex gap-2.5 text-[11px] text-muted-foreground">
        {segments.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1">
            <span className={cn("size-1.5 rounded-sm", s.color)} />
            {s.label} {s.pct}%
          </span>
        ))}
      </div>
    </div>
  )
}
