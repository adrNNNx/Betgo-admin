import "server-only"

import { apiFetch } from "@/lib/session"
import { getBars } from "@/lib/bares/api"
import type { BarRef, StaffMember, StaffRole, StaffStatus } from "@/lib/staff/types"

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

/** Listado de personal para el panel admin (GET /staff, solo ADMIN). */
export async function getStaff(): Promise<StaffMember[]> {
  const res = await apiFetch("/staff")
  if (!res.ok) throw new Error("No se pudo cargar el personal")
  const raw = (await res.json()) as RawStaff[]
  return raw.map(toMember)
}

/** Bares para filtros y selects. Reusa el endpoint real de bares (GET /bars). */
export async function getStaffBars(): Promise<BarRef[]> {
  const bars = await getBars()
  return bars.map((b) => ({ id: b.id, name: b.name }))
}
