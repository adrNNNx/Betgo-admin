"use server"

import { apiFetch } from "@/lib/session"
import type {
  ActionResult,
  Player,
  PlayerPage,
  PlayerTodayPlays,
  ResetPlaysResult,
} from "@/lib/jugadas/types"

// Las tres llamadas exigen rol admin en el backend (403 si no). El token sale de
// la cookie de sesión vía apiFetch; el id del admin nunca se manda.
//
// Sin console.log a propósito: los ids y teléfonos de jugadores no van a logs.

/** Mensaje del backend: `message` es un array en los 400 de validación de body. */
async function backendError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => null)) as { message?: unknown } | null
  const msg = data?.message
  if (Array.isArray(msg) && msg.length) return msg.map(String).join(", ")
  if (typeof msg === "string" && msg) return msg
  if (res.status === 401) return "No autorizado"
  if (res.status === 403) return "Acceso denegado"
  return "La operación falló. Probá de nuevo."
}

async function call<T>(path: string, init?: RequestInit): Promise<ActionResult<T>> {
  try {
    const res = await apiFetch(path, init)
    if (!res.ok) return { ok: false, error: await backendError(res) }
    return { ok: true, data: (await res.json()) as T }
  } catch {
    return { ok: false, error: "No se pudo conectar con el servidor." }
  }
}

/** GET /users?role=player — busca por nombre, email o teléfono (cualquier formato). */
export async function searchPlayers(
  search: string,
  offset: number,
  limit: number
): Promise<ActionResult<PlayerPage>> {
  const qs = new URLSearchParams({
    role: "player",
    search: search.trim(),
    limit: String(limit),
    offset: String(offset),
  })
  const res = await call<{ data?: Player[]; total?: number }>(`/users?${qs.toString()}`)
  if (!res.ok) return res
  const rows = res.data?.data ?? []
  return { ok: true, data: { data: rows, total: res.data?.total ?? rows.length } }
}

/** GET /user-daily-plays/users/:userId/today */
export async function getPlayerTodayPlays(
  userId: string
): Promise<ActionResult<PlayerTodayPlays>> {
  return call<PlayerTodayPlays>(
    `/user-daily-plays/users/${encodeURIComponent(userId)}/today`
  )
}

/**
 * POST /user-daily-plays/users/:userId/reset. Sin `barId` resetea TODOS los
 * bares: para "todos" el campo no se manda (no existe un valor "all").
 */
export async function resetPlayerPlays(
  userId: string,
  input: { barId?: string; reason: string }
): Promise<ActionResult<ResetPlaysResult>> {
  const body: { barId?: string; reason?: string } = {}
  if (input.barId) body.barId = input.barId
  const reason = input.reason.trim()
  if (reason) body.reason = reason

  return call<ResetPlaysResult>(
    `/user-daily-plays/users/${encodeURIComponent(userId)}/reset`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  )
}
