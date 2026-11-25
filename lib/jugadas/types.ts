/** Jugador tal como lo devuelve GET /users (role=player). */
export type Player = {
  id: string
  name: string | null
  phone: string
  email: string | null
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

export type PlayerPage = { data: Player[]; total: number }

/** Uso de jugadas gratis de HOY en un bar (mismo formato en el GET y en el reset). */
export type BarDailyPlays = {
  barId: string
  barName: string
  barSlug: string
  playsUsed: number
  playsLimit: number
  playsRemaining: number
}

/** GET /user-daily-plays/users/:userId/today */
export type PlayerTodayPlays = {
  user: { id: string; name: string | null; phone: string }
  /** YYYY-MM-DD en hora de Paraguay. */
  playDate: string
  /** Ordenado por nombre. Vacío = no jugó hoy en ningún bar (no es error). */
  bars: BarDailyPlays[]
  totalPlaysUsed: number
}

/** POST /user-daily-plays/users/:userId/reset */
export type ResetPlaysResult = {
  userId: string
  playDate: string
  scope: "bar" | "all"
  barId: string | null
  /** Bares que tenían jugadas usadas y se pusieron en 0. 0 = no había nada. */
  resetCount: number
  /** Total de jugadas devueltas. */
  playsRestored: number
  /** Estado actualizado: se usa para refrescar la vista sin otro GET. */
  bars: BarDailyPlays[]
}

/**
 * Resultado de las server actions de este módulo. Devuelven el error en vez de
 * tirarlo: en producción Next.js reemplaza el `message` de un Error lanzado en
 * una server action por un texto genérico, y acá el mensaje real del backend
 * ("Usuario no encontrado.", "Acceso denegado"…) es lo que el admin tiene que ver.
 */
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }
