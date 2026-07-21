export type StaffRole = "mozo" | "encargado" | "admin_bar"

export type StaffStatus = "active" | "inactive" | "suspended"

/** Tipo de identificador con el que el miembro inicia sesión. */
export type IdentifierKind = "email" | "phone" | "external"

export type StaffMember = {
  id: string
  /** Nombre visible del miembro. */
  name: string
  /** Email, teléfono o ID externo de acceso. Es el login: no se edita. */
  identifier: string
  /** Bar al que está asignado (null = sin asignar). */
  barId: string | null
  barName: string | null
  role: StaffRole
  status: StaffStatus
  /** Saldo/float asignado al mozo (el que puede cargar a usuarios). */
  balance: number
  /** Saldo disponible del bar asignado (tope para asignarle saldo). null = sin bar. */
  barBalance: number | null
  /** ISO date — opcional, para futuras columnas (último acceso, alta…). */
  createdAt?: string
  lastActiveAt?: string | null
}

/** Referencia mínima de bar para selects y filtros. */
export type BarRef = {
  id: string
  name: string
}

/** Filtros del listado. Se resuelven en el backend (paginación correcta). */
export type StaffQuery = {
  search: string
  /** id de bar, o "all" */
  barId: string
  role: StaffRole | "all"
  status: StaffStatus | "all"
}

export const DEFAULT_STAFF_QUERY: StaffQuery = {
  search: "",
  barId: "all",
  role: "all",
  status: "all",
}
