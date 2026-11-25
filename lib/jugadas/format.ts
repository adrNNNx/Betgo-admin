const TZ = "America/Asuncion"

/**
 * "2026-11-24" → "martes, 24 de noviembre de 2026". Se arma en UTC a propósito:
 * `playDate` ya es el día de Paraguay; pasarlo por la zona del navegador podría
 * correrlo un día.
 */
export function formatPlayDate(playDate: string): string {
  const [y, m, d] = playDate.split("-").map(Number)
  if (!y || !m || !d) return playDate
  return new Intl.DateTimeFormat("es-PY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)))
}

/** Último ingreso en hora de Paraguay: "24 nov 2026, 20:42" o "Nunca". */
export function formatLastLogin(iso: string | null): string {
  if (!iso) return "Nunca"
  return new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(new Date(iso))
}

/** "1 jugada" / "3 jugadas". */
export function playsLabel(n: number): string {
  return `${n} ${n === 1 ? "jugada" : "jugadas"}`
}

/** Nombre a mostrar: el jugador puede no tener nombre cargado. */
export function displayName(name: string | null): string {
  return name?.trim() || "Jugador sin nombre"
}
