"use server"

import { redirect } from "next/navigation"
import { setTokens, clearTokens, getRefreshToken, getAccessToken } from "@/lib/session"

export type LoginState = { error?: string }

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const phone = String(formData.get("phone") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!phone || !password) {
    return { error: "Ingresá tu teléfono y contraseña." }
  }

  let res: Response
  try {
    res = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password, deviceInfo: "betgo-admin" }),
      cache: "no-store",
    })
  } catch {
    return { error: "No se pudo conectar con el servidor." }
  }

  if (!res.ok) {
    return {
      error:
        res.status === 401
          ? "Credenciales inválidas."
          : "No se pudo iniciar sesión. Intentá de nuevo.",
    }
  }

  const data = await res.json()

  // Admin-only gate: el backend autentica a cualquier usuario activo, así que
  // el panel restringe el acceso a administradores.
  if (data?.user?.role !== "admin") {
    return { error: "Acceso restringido a administradores." }
  }

  await setTokens(
    data.tokens.accessToken,
    data.tokens.refreshToken,
    data.tokens.expiresIn
  )

  redirect("/dashboard")
}

export async function logout() {
  // Best-effort: revoca el refresh token en el backend; igual limpiamos cookies.
  const refreshToken = await getRefreshToken()
  const accessToken = await getAccessToken()
  if (refreshToken) {
    try {
      await fetch(`${process.env.BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      })
    } catch {
      // ignore
    }
  }
  await clearTokens()
  redirect("/login")
}
