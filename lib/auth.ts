// Contrato de auth compartido por TODOS los entornos (edge/proxy, server, cliente).
// Sin imports de `server-only` ni `next/headers`: cualquiera puede importarlo.
// El runtime de servidor (cookies, fetch a backend) vive en lib/session.ts.

export const ACCESS_COOKIE = "bg_access"
export const REFRESH_COOKIE = "bg_refresh"
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7 // 7d, igual a JWT_REFRESH_EXPIRES_IN

/**
 * Si las cookies de sesión salen con el flag `Secure`.
 *
 * No se deriva de NODE_ENV: el Dockerfile fuerza `production`, así que servir el
 * panel por HTTP en un host real hacía que el navegador descartara las cookies
 * (el login respondía OK y la sesión no persistía). `localhost` no lo mostraba
 * porque los navegadores lo tratan como contexto seguro por excepción.
 *
 * Default `true`: hay que pedir explícitamente que se apague, y sólo para
 * ambientes de prueba sin HTTPS.
 */
export const COOKIE_SECURE = process.env.COOKIE_SECURE !== "false"

/**
 * Marca que el layout agrega al mandar a /login cuando el backend rechazó un
 * token que sí estaba presente. El proxy la ve y borra las cookies: es la única
 * capa que puede escribirlas durante un request (un Server Component no puede).
 * Sin esto, proxy y layout se redirigen entre sí para siempre.
 */
export const EXPIRED_PARAM = "session_expired"

/** Opciones compartidas por las dos capas que escriben cookies de sesión. */
export const COOKIE_BASE = {
  httpOnly: true,
  secure: COOKIE_SECURE,
  sameSite: "lax" as const,
  path: "/",
}

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
