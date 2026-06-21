// Contrato de auth compartido por TODOS los entornos (edge/proxy, server, cliente).
// Sin imports de `server-only` ni `next/headers`: cualquiera puede importarlo.
// El runtime de servidor (cookies, fetch a backend) vive en lib/session.ts.

export const ACCESS_COOKIE = "bg_access"
export const REFRESH_COOKIE = "bg_refresh"
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7 // 7d, igual a JWT_REFRESH_EXPIRES_IN

export type Role = "player" | "staff" | "admin"

export type SessionUser = {
  id: string
  name: string | null
  phone: string
  email: string | null
  role: Role
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  staff: "Staff",
  player: "Jugador",
}

/** Único lugar donde se decide si un rol alcanza. Lo usan el server, el proxy y la UI. */
export function canAccess(role: Role, allowed?: Role[]): boolean {
  return !allowed || allowed.length === 0 || allowed.includes(role)
}
