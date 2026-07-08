"use client"

import { useTransition } from "react"
import { Copy, MoreHorizontal, Pause, Pencil, Play, Trash2 } from "lucide-react"

import type { Prize } from "@/lib/premios/types"
import { duplicatePrize, togglePrize } from "@/lib/premios/actions"
import { withToast } from "@/lib/run-action"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function PrizeRowActions({
  prize,
  barId,
  onEdit,
  onDelete,
}: {
  prize: Prize
  barId: string | null
  onEdit: (p: Prize) => void
  onDelete: (p: Prize) => void
}) {
  const [pending, startTransition] = useTransition()

  const run = (fn: () => Promise<unknown>, msg: string) =>
    startTransition(() => {
      void withToast(fn, msg)
    })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground" disabled={pending}>
          <MoreHorizontal />
          <span className="sr-only">Acciones de {prize.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => onEdit(prize)}>
          <Pencil />
          Editar premio
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            run(
              () =>
                duplicatePrize(barId, {
                  name: prize.name,
                  desc: prize.desc,
                  value: prize.value,
                  stock: prize.stock,
                }),
              "Premio duplicado"
            )
          }
        >
          <Copy />
          Duplicar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            run(
              () => togglePrize(prize.id),
              prize.status === "active" ? "Premio pausado" : "Premio activado"
            )
          }
        >
          {prize.status === "active" ? <Pause /> : <Play />}
          {prize.status === "active" ? "Pausar" : "Activar"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(prize)}>
          <Trash2 />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
