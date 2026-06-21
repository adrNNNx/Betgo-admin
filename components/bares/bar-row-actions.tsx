"use client"

import {
  MoreHorizontal,
  Wallet,
  Gift,
  Image as ImageIcon,
  Pencil,
  Dices,
  Power,
  Trash2,
} from "lucide-react"

import type { Bar } from "@/lib/bares/types"
import type { BarDialogKind } from "@/components/bares/bares-manager"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function BarRowActions({
  bar,
  onAction,
}: {
  bar: Bar
  onAction: (kind: BarDialogKind, bar: Bar) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <MoreHorizontal />
          <span className="sr-only">Acciones de {bar.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Operación</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onAction("recharge", bar)}>
          <Wallet />
          Recargar saldo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("freeplays", bar)}>
          <Gift />
          Configurar jugadas
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("image", bar)}>
          <ImageIcon />
          Imagen del bar
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Administrar</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onAction("edit", bar)}>
          <Pencil />
          Editar datos
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("symbols", bar)}>
          <Dices />
          Símbolos de la máquina
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Power />
          {bar.status === "active" ? "Pausar bar" : "Activar bar"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onAction("delete", bar)}
        >
          <Trash2 />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
