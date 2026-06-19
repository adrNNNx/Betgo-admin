import { cookies } from "next/headers"

// ponytail: tokens live in httpOnly cookies (XSS-safe). Server actions talk to
// the backend server-to-server, so the browser never sees a token and CORS
// never applies. Cookie name kept in sync with middleware.ts by hand.
export const ACCESS_COOKIE = "bg_access"
export const REFRESH_COOKIE = "bg_refresh"

const REFRESH_MAX_AGE = 60 * 60 * 24 * 7 // 7d, matches backend JWT_REFRESH_EXPIRES_IN

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
