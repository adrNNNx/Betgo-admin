import "server-only"
import { cookies } from "next/headers"
import { cache } from "react"

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  type SessionUser,
} from "@/lib/auth"

// ponytail: tokens en cookies httpOnly (XSS-safe). Server-to-server, sin CORS.
// El refresh-on-expiry lo hace proxy.ts antes de cada request protegido, así que
// acá sólo leemos un access token ya vigente.

export async function setTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
) {
  const jar = await cookies()
  const secure = process.env.NODE_ENV === "production"
  const base = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" }
  jar.set(ACCESS_COOKIE, accessToken, { ...base, maxAge: expiresIn })
  jar.set(REFRESH_COOKIE, refreshToken, { ...base, maxAge: REFRESH_MAX_AGE })
}

export async function clearTokens() {
  const jar = await cookies()
  jar.delete(ACCESS_COOKIE)
  jar.delete(REFRESH_COOKIE)
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value ?? null
}

/**
 * Usuario logueado, leído del backend. `cache()` lo deduplica dentro de un mismo
 * render (layout + header + breadcrumbs comparten una sola llamada).
 *
 * ponytail: ceiling — si el backend revoca la sesión mientras el access token
 * sigue vigente (<15m), esto devuelve null y el layout manda a /login. Aceptable;
 * el refresh-on-401 a nivel de cada endpoint se agrega cuando los módulos
 * empiecen a consumir datos.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const token = await getAccessToken()
  if (!token) return null

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (!res.ok) return null
    const u = await res.json()
    return {
      id: u.id,
      name: u.name ?? null,
      phone: u.phone,
      email: u.email ?? null,
      role: u.role,
    }
  } catch {
    return null
  }
})
