"use client"

import { ChevronUp, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Controles de reordenamiento por displayOrder. Subir/bajar mueve el banner
 * dentro de su carrusel (mismo alcance). Simple y robusto — sin dependencias
 * de drag-and-drop. El número es el displayOrder actual.
 */
export function BannerOrderControls({
  order,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  order: number
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-grid h-6 min-w-6 place-items-center rounded-sm bg-secondary px-1.5 text-sm font-semibold tabular-nums">
        {order}
      </span>
      <div className="flex flex-col">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          aria-label="Subir en el orden"
          className={cn(
            "flex h-3.5 w-5 items-center justify-center rounded-t-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
            !canMoveUp && "pointer-events-none opacity-30"
          )}
        >
          <ChevronUp className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          aria-label="Bajar en el orden"
          className={cn(
            "flex h-3.5 w-5 items-center justify-center rounded-b-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
            !canMoveDown && "pointer-events-none opacity-30"
          )}
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
