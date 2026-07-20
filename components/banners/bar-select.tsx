"use client"

import { Globe, Store } from "lucide-react"

import type { BannerBarRef } from "@/lib/banners/types"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/** Sentinela para representar el banner GLOBAL (barId = null) en el Select. */
export const GLOBAL_VALUE = "__global__"

/**
 * Selector de alcance de un banner: Global (barId null) o un bar específico.
 * Se reutiliza en el formulario y (con `allowAll`) como filtro del listado,
 * manteniendo consistente el criterio Global vs Bar entre módulos.
 */
export function BarSelect({
  value,
  onChange,
  bars,
  allowAll = false,
  allowGlobal = true,
  id,
  className,
}: {
  /** null = global; ""/undefined con allowAll = todos; string = barId. */
  value: string | null | undefined
  onChange: (value: string | null) => void
  bars: BannerBarRef[]
  allowAll?: boolean
  allowGlobal?: boolean
  id?: string
  className?: string
}) {
  const ALL_VALUE = "__all__"
  const current =
    value === null ? GLOBAL_VALUE : value === undefined || value === "" ? ALL_VALUE : value

  const handle = (v: string) => {
    if (v === ALL_VALUE) return onChange("")
    if (v === GLOBAL_VALUE) return onChange(null)
    onChange(v)
  }

  return (
    <Select value={current} onValueChange={handle}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder="Seleccionar…" />
      </SelectTrigger>
      <SelectContent>
        {allowAll && <SelectItem value={ALL_VALUE}>Todos los alcances</SelectItem>}
        {allowGlobal && (
          <SelectItem value={GLOBAL_VALUE}>
            <Globe className="size-4 text-muted-foreground" />
            Global (todos los bares)
          </SelectItem>
        )}
        {(allowAll || allowGlobal) && bars.length > 0 && <SelectSeparator />}
        <SelectGroup>
          <SelectLabel>Bares</SelectLabel>
          {bars.map((bar) => (
            <SelectItem key={bar.id} value={bar.id}>
              <Store className="size-4 text-muted-foreground" />
              {bar.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
