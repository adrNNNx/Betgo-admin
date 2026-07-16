import "server-only"

import { apiFetch } from "@/lib/session"
import { getBars } from "@/lib/bares/api"
import type {
  BarRef,
  StaffMember,
  StaffQuery,
  StaffRole,
  StaffStatus,
} from "@/lib/staff/types"

// Forma que devuelve GET /staff (staff + user + bar), tal cual el `format()`
// del backend.
type RawStaff = {
  id: string
  role: string
  isActive: boolean
  status: StaffStatus
  barId: string | null
  bar?: { id: string; name: string } | null
  user?: {
    id: string
    name: string | null
    phone: string | null
    email: string | null
  } | null
}

const STATUSES: StaffStatus[] = ["active", "inactive", "suspended"]

// El backend maneja también `super_admin`; el panel lo trata como admin de bar.
const ROLE_MAP: Record<string, StaffRole> = {
  mozo: "mozo",
  encargado: "encargado",
  admin_bar: "admin_bar",
  super_admin: "admin_bar",
}

function toMember(r: RawStaff): StaffMember {
  const u = r.user
  return {
    id: r.id,
    name: u?.name ?? "(sin nombre)",
    // El login es el email; si no hay, cae a teléfono y luego al id de usuario.
    identifier: u?.email || u?.phone || u?.id || r.id,
    barId: r.barId ?? null,
    barName: r.bar?.name ?? null,
    role: ROLE_MAP[r.role] ?? "mozo",
    // El backend expone `status` (active/inactive/suspended); caemos a isActive
    // solo por defensa si viniera algo inesperado.
    status: STATUSES.includes(r.status) ? r.status : r.isActive ? "active" : "inactive",
  }
}

export type StaffPage = { data: StaffMember[]; total: number }

/**
 * Página del listado de personal (GET /staff, solo ADMIN).
 *
 * Búsqueda, filtros y paginación se resuelven en el backend: así buscar encuentra
 * en TODO el staff, no solo en la página cargada, y no hay techo de registros.
 */
export async function getStaffPage(
  q: StaffQuery,
  limit: number,
  offset: number
): Promise<StaffPage> {
  const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) })
  if (q.search.trim()) qs.set("search", q.search.trim())
  if (q.barId !== "all") qs.set("barId", q.barId)
  if (q.role !== "all") qs.set("role", q.role)
  if (q.status !== "all") qs.set("status", q.status)

  const res = await apiFetch(`/staff?${qs.toString()}`)
  if (!res.ok) throw new Error("No se pudo cargar el personal")
  const json = (await res.json()) as { data?: RawStaff[]; total?: number } | null
  const rows = json?.data ?? []
  return { data: rows.map(toMember), total: json?.total ?? rows.length }
}

export type StaffSummary = {
  total: number
  active: number
  inactive: number
  suspended: number
  mozos: number
  managers: number
}

/** Totales del staff para los KPIs (GET /staff/summary): la tabla está paginada. */
export async function getStaffSummary(): Promise<StaffSummary> {
  const res = await apiFetch("/staff/summary")
  if (!res.ok) throw new Error("No se pudo cargar el resumen del personal")
  return (await res.json()) as StaffSummary
}

/** Bares para filtros y selects. Reusa el endpoint real de bares (GET /bars). */
export async function getStaffBars(): Promise<BarRef[]> {
  const bars = await getBars()
  return bars.map((b) => ({ id: b.id, name: b.name }))
}
