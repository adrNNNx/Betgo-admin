import type {
  Banner,
  BannerComputedStatus,
  BannerScope,
} from "@/lib/banners/types"

/** GLOBAL cuando no hay bar dueño. */
export function bannerScope(banner: Pick<Banner, "barId">): BannerScope {
  return banner.barId ? "local" : "global"
}

/**
 * Estado *real* del banner combinando el toggle isActive con la ventana
 * startsAt/endsAt. Es la misma semántica que usa GET /banners/active:
 *
 *  - inactive  → isActive = false (apagado manualmente)
 *  - scheduled → activo pero aún no llegó startsAt
 *  - expired   → activo pero ya pasó endsAt
 *  - active    → activo y dentro de la ventana (se muestra en el carrusel)
 */
export function computeBannerStatus(
  banner: Pick<Banner, "isActive" | "startsAt" | "endsAt">,
  now: Date = new Date()
): BannerComputedStatus {
  if (!banner.isActive) return "inactive"
  const t = now.getTime()
  if (banner.startsAt && t < new Date(banner.startsAt).getTime()) return "scheduled"
  if (banner.endsAt && t > new Date(banner.endsAt).getTime()) return "expired"
  return "active"
}

/** true si el banner se muestra ahora mismo en el carrusel público. */
export function isLiveNow(banner: Banner, now: Date = new Date()): boolean {
  return computeBannerStatus(banner, now) === "active"
}

/* ------------------------------------------------------------------ *
 * Helpers de fechas para <input type="date"> (sin librerías)
 *
 * Se usa fecha (día) en vez de datetime-local a propósito: datetime-local
 * devuelve vacío hasta que se completan fecha Y hora, así que era fácil
 * "programar" un banner sin querer con el campo vacío. Con día suelto la
 * programación es confiable; el inicio abarca todo el día y el fin también.
 * ------------------------------------------------------------------ */

/** ISO -> valor para <input type="date"> (YYYY-MM-DD en hora local). */
export function isoToDateInput(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** "YYYY-MM-DD" -> ISO al inicio de ese día (00:00 local). null si vacío. */
export function dateInputToStartIso(value: string): string | null {
  if (!value) return null
  return new Date(`${value}T00:00:00`).toISOString()
}

/** "YYYY-MM-DD" -> ISO al fin de ese día (23:59:59.999 local). null si vacío. */
export function dateInputToEndIso(value: string): string | null {
  if (!value) return null
  return new Date(`${value}T23:59:59.999`).toISOString()
}

/** startsAt < endsAt (misma validación que hace el backend, code 400). */
export function isValidWindow(
  startsAt: string | null,
  endsAt: string | null
): boolean {
  if (!startsAt || !endsAt) return true
  return new Date(startsAt).getTime() < new Date(endsAt).getTime()
}

/** "14 jul 2026, 18:30" — o "—" si no hay fecha. */
export function formatDateTime(iso: string | null): string {
  if (!iso) return "—"
  return new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

/** "14 jul 2026" — versión corta para columnas compactas. */
export function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso))
}
