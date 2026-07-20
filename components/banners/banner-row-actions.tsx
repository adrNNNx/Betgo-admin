"use client"

import {
  MoreHorizontal,
  Pencil,
  ImageIcon,
  Power,
  ExternalLink,
  Trash2,
} from "lucide-react"

import type { Banner } from "@/lib/banners/types"
import type { BannerDialogKind } from "@/components/banners/banners-manager"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function BannerRowActions({
  banner,
  onAction,
  onToggle,
}: {
  banner: Banner
  onAction: (kind: BannerDialogKind, banner: Banner) => void
  onToggle: (banner: Banner) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <MoreHorizontal />
          <span className="sr-only">Acciones de {banner.title}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Contenido</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onAction("edit", banner)}>
          <Pencil />
          Editar datos
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("replace-image", banner)}>
          <ImageIcon />
          Reemplazar imagen
        </DropdownMenuItem>
        {banner.linkUrl && (
          <DropdownMenuItem asChild>
            <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink />
              Abrir enlace
            </a>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Estado</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onToggle(banner)}>
          <Power />
          {banner.isActive ? "Desactivar" : "Activar"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onAction("delete", banner)}>
          <Trash2 />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
