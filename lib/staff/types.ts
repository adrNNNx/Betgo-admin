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
  /** ISO date — opcional, para futuras columnas (último acceso, alta…). */
  createdAt?: string
  lastActiveAt?: string | null
}

/** Referencia mínima de bar para selects y filtros. */
export type BarRef = {
  id: string
  name: string
}
