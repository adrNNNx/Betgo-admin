"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { PERIODS, type Period } from "@/lib/dashboard/period"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/** Cambia el ?period= de la URL; el server component re-renderiza las métricas. */
export function PeriodSelector({ value }: { value: Period }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const onChange = (next: string) => {
    if (!next) return
    const qs = new URLSearchParams(params)
    qs.set("period", next)
    router.push(`${pathname}?${qs}`)
  }

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={onChange}
      variant="outline"
      size="sm"
    >
      {PERIODS.map((p) => (
        <ToggleGroupItem key={p.value} value={p.value}>
          {p.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
