"use client"

import { useRef, useState } from "react"

import type { Bar, BarSymbol } from "@/lib/bares/types"
import { BaresManager } from "@/components/bares/bares-manager"
import { BarSymbols } from "@/components/bares/bar-symbols"

// Estado compartido entre la tabla (acción "Símbolos de la máquina") y la sección
// de configuración de símbolos. Viven en este ancestro común para no acoplarlos
// por URL (evita refetch) ni por eventos globales.
export function BaresScreen({
  bars,
  globalSymbols,
}: {
  bars: Bar[]
  globalSymbols: BarSymbol[]
}) {
  const [activeBarId, setActiveBarId] = useState(bars[0]?.id ?? "")
  const symbolsRef = useRef<HTMLDivElement>(null)

  const focusSymbols = (barId: string) => {
    setActiveBarId(barId)
    symbolsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <>
      <BaresManager bars={bars} onOpenSymbols={focusSymbols} />
      <div ref={symbolsRef} className="scroll-mt-20">
        <BarSymbols
          bars={bars}
          globalSymbols={globalSymbols}
          activeBarId={activeBarId}
          onActiveBarChange={setActiveBarId}
        />
      </div>
    </>
  )
}
