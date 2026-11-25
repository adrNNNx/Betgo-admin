/** Jugadores por página en el buscador del reinicio de jugadas gratis. */
export const PLAYERS_PAGE_SIZE = 10

/** Debajo de esto no se busca: evita listar a medio padrón con una letra. */
export const PLAYER_SEARCH_MIN_CHARS = 2

/** Espera tras la última tecla antes de buscar. */
export const PLAYER_SEARCH_DEBOUNCE_MS = 300

/** Tope del motivo, igual al del backend. */
export const RESET_REASON_MAX = 255

/** Motivos frecuentes para completar el campo con un clic. */
export const RESET_REASON_PRESETS = [
  "Se cayó la red del bar",
  "Falla de la app",
  "Reclamo válido del jugador",
]
