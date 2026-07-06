"use client"

import { useState } from "react"
import { Mail, Phone, Fingerprint, Copy, Check } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { IdentifierKind } from "@/lib/staff/types"
import { identifierKind } from "@/lib/staff/identifier"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const ICON: Record<IdentifierKind, LucideIcon> = {
  email: Mail,
  phone: Phone,
  external: Fingerprint,
}

export function StaffIdentifier({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const Icon = ICON[identifierKind(value)]

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard no disponible */
    }
  }

  return (
    <div className="group/ident flex max-w-[260px] items-center gap-1.5">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      <code
        title={value}
        className="truncate rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
      >
        {value}
      </code>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={copy}
            className="size-6 shrink-0 text-muted-foreground opacity-0 transition group-hover/ident:opacity-100"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            <span className="sr-only">Copiar identificador</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copiado" : "Copiar"}</TooltipContent>
      </Tooltip>
    </div>
  )
}
