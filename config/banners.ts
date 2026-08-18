import type { BannerComputedStatus, BannerScope } from "@/lib/banners/types"
import type { ImagePolicy } from "@/lib/banners/image"

/**
 * Límite de peso de imagen. El backend rechaza banners > 3MB (más estricto
 * que bares, que permite 5MB). Mantenemos el nombre MAX_IMAGE_MB local.
 */
export const MAX_IMAGE_MB = 3

/**
 * Tipos aceptados por el endpoint (jpg/png/webp/gif).
 * Si tu config/bares.ts ya exporta IMAGE_ACCEPT, importalo desde ahí para
 * mantener una sola fuente de verdad (como hace config/premios.ts).
 */
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif"

/** Reexport del límite de bares por si algún form mixto lo necesita. */
export { MAX_IMAGE_MB as BAR_MAX_IMAGE_MB } from "@/config/bares"

/**
 * Cómo se ve el banner en la app del cliente. Medido sobre
 * `betgo-usuarios/components/BannerCarousel.tsx`, que renderiza la imagen en
 * una caja `aspect-[3.5/1] sm:aspect-[4/1]` con `object-cover` dentro de un
 * contenedor `max-w-2xl`:
 *
 *   - celular (viewport 375px): 333 × 95 px  → 3.5:1
 *   - desktop (tope, no crece):  662 × 166 px → 4:1
 *
 * `object-cover` nunca deforma: siempre recorta. Como la caja pasa de 4:1 a
 * 3.5:1, una imagen 4:1 pierde ~6,25% de ancho de cada lado en celular.
 */
export const BANNER_IMAGE = {
  /** Medida recomendada: ~2x el render máximo, nítida en retina. */
  width: 1400,
  height: 350,
  /** Relación objetivo (1400/350). El desktop usa exactamente ésta. */
  ratio: 4,
  /** Relación en celular, la que más recorta. */
  mobileRatio: 3.5,
  /** Desvío tolerado sobre `ratio` antes de avisar (10%). */
  ratioTolerance: 0.1,
  /** Debajo de este ancho se ve borrosa en pantallas retina. */
  minWidth: 1000,
  /** Peso sugerido: el banner se baja sin optimizar en la wifi de un bar. */
  idealKb: 200,
  /** Zona segura sobre la medida recomendada, en px. */
  safeArea: { x: 90, bottom: 60 },
} as const

/** Zona segura como porcentajes, para dibujarla sobre cualquier preview. */
export const SAFE_AREA_PCT = {
  x: (BANNER_IMAGE.safeArea.x / BANNER_IMAGE.width) * 100,
  bottom: (BANNER_IMAGE.safeArea.bottom / BANNER_IMAGE.height) * 100,
}

/** Umbrales que consume `analyzeImage()`. */
export const IMAGE_POLICY: ImagePolicy = {
  ratio: BANNER_IMAGE.ratio,
  ratioTolerance: BANNER_IMAGE.ratioTolerance,
  minWidth: BANNER_IMAGE.minWidth,
  idealKb: BANNER_IMAGE.idealKb,
  maxMb: MAX_IMAGE_MB,
}

/** Paginación client-side (mismo criterio que bares/premios). */
export const PAGE_SIZE = 10

/** Metadata visual del estado calculado (paleta consistente con el admin). */
export const BANNER_STATUS: Record<
  BannerComputedStatus,
  { label: string; description: string; className: string }
> = {
  active: {
    label: "Activo",
    description: "Visible ahora en el carrusel.",
    className:
      "border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  scheduled: {
    label: "Programado",
    description: "Se activará al llegar la fecha de inicio.",
    className:
      "border-transparent bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
  expired: {
    label: "Expirado",
    description: "La fecha de fin ya pasó.",
    className:
      "border-transparent bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-500",
  },
  inactive: {
    label: "Desactivado",
    description: "Apagado manualmente (toggle).",
    className: "border-transparent bg-muted text-muted-foreground",
  },
}

/** Metadata visual del alcance Global vs Bar. */
export const BANNER_SCOPE: Record<
  BannerScope,
  { label: string; className: string }
> = {
  global: {
    label: "Global",
    className:
      "border-transparent bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
  },
  local: {
    label: "Bar",
    className:
      "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
  },
}

export const STATUS_FILTERS: {
  value: BannerComputedStatus | "all"
  label: string
}[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "scheduled", label: "Programados" },
  { value: "expired", label: "Expirados" },
  { value: "inactive", label: "Desactivados" },
]

export const SCOPE_FILTERS: { value: BannerScope | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "global", label: "Globales" },
  { value: "local", label: "Por bar" },
]
