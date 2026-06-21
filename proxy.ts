import { NextResponse, type NextRequest } from "next/server"

import { ACCESS_COOKIE, REFRESH_COOKIE, REFRESH_MAX_AGE } from "@/lib/auth"

// ponytail: el access cookie tiene maxAge = expiresIn (15m), así que el navegador
// lo borra solo al vencer. Entonces "no hay access pero sí refresh" == token
// vencido → rotamos acá, una sola vez, antes de que renderice cualquier RSC.
// Es el único lugar de la app que puede escribir cookies durante un request
// (los Server Components no pueden), por eso el refresh vive en el proxy.

async function refresh(refreshToken: string) {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    })
    if (!res.ok) return null
    return (await res.json()) as {
      accessToken: string
      refreshToken: string
      expiresIn: number
    }
  } catch {
    return null
  }
}

export async function proxy(req: NextRequest) {
  const isLogin = req.nextUrl.pathname === "/login"
  const access = req.cookies.get(ACCESS_COOKIE)?.value
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value
  const secure = process.env.NODE_ENV === "production"

  // Sin refresh token = sin sesión.
  if (!refreshToken) {
    return isLogin
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", req.url))
  }

  // Access token vigente → seguir (y echar de /login si ya está logueado).
  if (access) {
    return isLogin
      ? NextResponse.redirect(new URL("/dashboard", req.url))
      : NextResponse.next()
  }

  // Access vencido pero hay refresh → rotamos tokens.
  const tokens = await refresh(refreshToken)
  if (!tokens) {
    const res = isLogin
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", req.url))
    res.cookies.delete(ACCESS_COOKIE)
    res.cookies.delete(REFRESH_COOKIE)
    return res
  }

  // Propagar al request actual para que el RSC lea ya el token nuevo...
  req.cookies.set(ACCESS_COOKIE, tokens.accessToken)
  req.cookies.set(REFRESH_COOKIE, tokens.refreshToken)
  const res = isLogin
    ? NextResponse.redirect(new URL("/dashboard", req.url))
    : NextResponse.next({ request: { headers: req.headers } })

  // ...y persistir en el navegador.
  const base = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" }
  res.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    ...base,
    maxAge: tokens.expiresIn,
  })
  res.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...base,
    maxAge: REFRESH_MAX_AGE,
  })
  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}
