"use client"

import { useEffect, useState, useTransition } from "react"
import { Check, Copy, Download, ExternalLink, QrCode } from "lucide-react"

import type { Bar } from "@/lib/bares/types"
import { getBarQr, type BarQr } from "@/lib/bares/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Muestra el QR de acceso del bar (la URL a la que apunta) para que el admin lo
 * revise, copie el enlace, lo abra o descargue el PNG.
 */
export function BarQrDialog({
  open,
  bar,
  onClose,
}: {
  open: boolean
  bar: Bar | null
  onClose: () => void
}) {
  const [qr, setQr] = useState<BarQr | null>(null)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (!open || !bar) return
    setQr(null)
    setError(false)
    setCopied(false)
    const barId = bar.id
    startTransition(async () => {
      try {
        setQr(await getBarQr(barId))
      } catch {
        setError(true)
      }
    })
  }, [open, bar])

  const copy = async () => {
    if (!qr) return
    try {
      await navigator.clipboard.writeText(qr.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard no disponible */
    }
  }

  const download = () => {
    if (!qr || !bar) return
    const a = document.createElement("a")
    a.href = qr.qrDataUrl
    a.download = `qr-${qr.slug || bar.slug}.png`
    a.click()
  }

  if (!bar) return null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="size-4 text-muted-foreground" />
            QR de acceso · {bar.name}
          </DialogTitle>
          <DialogDescription>
            Escanealo o compartí el enlace para acceder a este Bar.
          </DialogDescription>
        </DialogHeader>

        {/* QR */}
        <div className="flex justify-center">
          {error ? (
            <div className="flex size-56 items-center justify-center rounded-xl border border-dashed text-center text-sm text-muted-foreground">
              No se pudo generar el código QR.
            </div>
          ) : qr ? (
            <div className="rounded-xl border bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr.qrDataUrl} alt={`QR de ${bar.name}`} className="size-52" />
            </div>
          ) : (
            <Skeleton className="size-56 rounded-xl" />
          )}
        </div>

        {/* enlace */}
        <div className="grid gap-2">
          <Label htmlFor="qr-url">Enlace de acceso</Label>
          <div className="flex gap-2">
            <Input
              id="qr-url"
              readOnly
              value={qr?.url ?? ""}
              placeholder={error ? "—" : "Generando…"}
              className="font-mono text-xs"
              onFocus={(e) => e.currentTarget.select()}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!qr}
              onClick={copy}
              title="Copiar enlace"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
          {qr?.accessCode && (
            <p className="text-xs text-muted-foreground">
              Código de acceso:{" "}
              <span className="font-mono text-foreground">{qr.accessCode}</span>
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={!qr}
            asChild={Boolean(qr)}
          >
            {qr ? (
              <a href={qr.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                Abrir enlace
              </a>
            ) : (
              <span>
                <ExternalLink className="size-4" />
                Abrir enlace
              </span>
            )}
          </Button>
          <Button variant="outline" className="flex-1" disabled={!qr} onClick={download}>
            <Download className="size-4" />
            Descargar PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
