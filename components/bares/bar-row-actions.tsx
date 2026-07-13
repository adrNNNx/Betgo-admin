"use client"

import {
  MoreHorizontal,
  Wallet,
  Gift,
  Image as ImageIcon,
  Pencil,
  Dices,
  Power,
  QrCode,
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
        <DropdownMenuItem onClick={() => onAction("qr", bar)}>
          <QrCode />
          Código QR de acceso
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

        <DropdownMenuSeparator />
        {bar.status === "active" ? (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onAction("deactivate", bar)}
          >
            <Power />
            Desactivar bar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onAction("activate", bar)}>
            <Power />
            Activar bar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
