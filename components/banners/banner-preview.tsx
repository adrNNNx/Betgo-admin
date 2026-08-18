"use client"

import { useState } from "react"
import { Monitor, Smartphone } from "lucide-react"

import { BANNER_IMAGE, SAFE_AREA_PCT } from "@/config/banners"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type Device = "mobile" | "desktop"

const DEVICES: {
  value: Device
  label: string
  icon: typeof Monitor
  ratio: number
  size: string
}[] = [
  {
    value: "mobile",
    label: "Celular",
    icon: Smartphone,
    ratio: BANNER_IMAGE.mobileRatio,
    size: "333 × 95",
  },
  {
    value: "desktop",
    label: "Escritorio",
    icon: Monitor,
    ratio: BANNER_IMAGE.ratio,
    size: "662 × 166",
  },
]

/**
 * Muestra el banner como lo va a ver el cliente, no como es el archivo.
 *
 * La app usa `object-cover` en una caja `aspect-[3.5/1] sm:aspect-[4/1]`, así
 * que replicamos eso mismo: el preview tiene que revelar el recorte, que es
 * justo lo que un `object-contain` esconde. Arranca en celular porque es la
 * relación que más corta.
 */
export function BannerPreview({ src }: { src: string }) {
  const [device, setDevice] = useState<Device>("mobile")
  const [showSafe, setShowSafe] = useState(true)
  const active = DEVICES.find((d) => d.value === device)!

  return (
    <div className="space-y-2 rounded-lg border bg-secondary/40 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup
          type="single"
          value={device}
          onValueChange={(v) => v && setDevice(v as Device)}
          variant="outline"
          size="sm"
        >
          {DEVICES.map((d) => (
            <ToggleGroupItem key={d.value} value={d.value} className="gap-1.5">
              <d.icon className="size-3.5" />
              {d.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <span className="text-[11px] tabular-nums text-muted-foreground">
          {active.size} px · {active.ratio}:1
        </span>

        <button
          type="button"
          onClick={() => setShowSafe((s) => !s)}
          className="ml-auto text-[11px] text-muted-foreground underline-offset-2 hover:underline"
        >
          {showSafe ? "Ocultar" : "Ver"} zona segura
        </button>
      </div>

      {/* Réplica de la caja real: mismo aspect, mismo object-cover, mismo
          redondeo y el mismo degradado que la app dibuja encima. */}
      <div
        className="relative w-full overflow-hidden rounded-xl border"
        style={{ aspectRatio: `${active.ratio} / 1` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Vista previa del banner" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {showSafe && (
          <div
            className="pointer-events-none absolute rounded-sm border border-dashed border-white/70 mix-blend-difference"
            style={{
              left: `${SAFE_AREA_PCT.x}%`,
              right: `${SAFE_AREA_PCT.x}%`,
              top: 0,
              bottom: `${SAFE_AREA_PCT.bottom}%`,
            }}
          />
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Vista previa del banner en {active.label.toLowerCase()}.{" "}
      </p>
    </div>
  )
}
