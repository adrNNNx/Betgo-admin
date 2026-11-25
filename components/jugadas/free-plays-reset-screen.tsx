"use client"

import { useEffect, useRef, useState } from "react"
import { MousePointerClick } from "lucide-react"

import type { Player } from "@/lib/jugadas/types"
import { Card } from "@/components/ui/card"
import { PlayerSearch } from "@/components/jugadas/player-search"
import { PlayerPlaysDetail } from "@/components/jugadas/player-plays-detail"

/**
 * Reinicio de jugadas gratis: buscador a la izquierda, detalle del jugador a la
 * derecha. El jugador elegido vive sólo en estado (no en la URL).
 */
export function FreePlaysResetScreen() {
  const [player, setPlayer] = useState<Player | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  // En pantallas chicas el detalle queda debajo de la lista: lo traemos a la vista.
  useEffect(() => {
    if (!player || window.matchMedia("(min-width: 1024px)").matches) return
    detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [player])

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Devolver jugadas gratis</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          Para cuando un jugador perdió jugadas por una falla (se cayó la red del bar,
          un error de la app, un reclamo válido). Sólo afecta el día de hoy y queda
          registrado en la auditoría.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <PlayerSearch selectedId={player?.id ?? null} onSelect={setPlayer} />

        {player ? (
          <div ref={detailRef} className="scroll-mt-20">
            <PlayerPlaysDetail key={player.id} player={player} />
          </div>
        ) : (
          <Card className="hidden items-center justify-center gap-2 border-dashed py-16 text-center lg:flex">
            <MousePointerClick className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">Elegí un jugador</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Vas a ver cuántas jugadas gratis usó hoy en cada bar.
            </p>
          </Card>
        )}
      </div>
    </>
  )
}
