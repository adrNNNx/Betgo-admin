"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import type { Scope } from "@/lib/premios/types"
import { unassignedSymbols } from "@/lib/premios/helpers"
import { Input } from "@/components/ui/input"
import { ScopeAvatar } from "@/components/premios/prize-badges"
import { cn } from "@/lib/utils"

const PALETTE = [
  "oklch(0.55 0.16 255)",
  "oklch(0.55 0.16 25)",
  "oklch(0.52 0.13 150)",
  "oklch(0.5 0.16 300)",
  "oklch(0.58 0.15 85)",
  "oklch(0.53 0.14 200)",
]

export function ScopeRail({
  scopes,
  activeId,
  onSelect,
}: {
  scopes: Scope[]
  activeId: string
  onSelect: (id: string) => void
}) {
  const [q, setQ] = useState("")

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    let barIndex = -1
    return scopes
      .map((s) => {
        const color =
          s.type === "global"
            ? "var(--gold, oklch(0.72 0.15 85))"
            : PALETTE[(++barIndex) % PALETTE.length]
        return { scope: s, color }
      })
      .filter(
        ({ scope: s }) =>
          !query ||
          s.name.toLowerCase().includes(query) ||
          s.location.toLowerCase().includes(query)
      )
  }, [scopes, q])

  return (
    <aside className="flex flex-col border-b md:border-r md:border-b-0">
      <div className="relative border-b p-3">
        <Search className="absolute left-5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar ámbito…"
          className="pl-8"
        />
      </div>
      <div className="flex max-h-[520px] flex-col gap-0.5 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">Sin resultados</p>
        ) : (
          filtered.map(({ scope: s, color }) => {
            const unass = unassignedSymbols(s).length
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md border border-transparent px-2 py-2 text-left transition-colors hover:bg-accent",
                  s.id === activeId && "border-border bg-secondary"
                )}
              >
                <ScopeAvatar scope={s} color={color} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13px] font-semibold">{s.name}</span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {s.location}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  {unass > 0 && (
                    <span
                      className="size-2 rounded-full bg-amber-500"
                      title={`${unass} símbolo(s) sin premio`}
                    />
                  )}
                  <span
                    className={cn(
                      "grid h-5 min-w-[22px] place-items-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums text-muted-foreground",
                      s.id === activeId ? "bg-background" : "bg-secondary"
                    )}
                  >
                    {s.prizes.length}
                  </span>
                </span>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}
