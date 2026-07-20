/**
 * Dominio del módulo Banners (carrusel promocional del panel admin).
 * Refleja la entidad Banner del backend (NestJS + Sequelize).
 */

/** Referencia mínima al bar dueño de un banner LOCAL (backend incluye {id,name,slug}). */
export type BannerBarRef = {
  id: string
  name: string
  slug: string
}

export type Banner = {
  id: string
  /** null = banner GLOBAL (todos los bares); uuid = banner LOCAL de un bar. */
  barId: string | null
  /** Se incluye cuando barId != null (belongsTo Bar). */
  bar?: BannerBarRef | null
  title: string
  description: string | null
  /** URL en Cloudinary, generada por el backend al subir. */
  imageUrl: string
  /** Interno de Cloudinary, no editable desde el front. */
  publicId: string
  /** URL de destino al tocar el banner. Opcional. */
  linkUrl: string | null
  /** Orden dentro del carrusel (asc). */
  displayOrder: number
  /** Toggle puro almacenado en la BD. */
  isActive: boolean
  /** Inicio de visibilidad programada (ISO) o null. */
  startsAt: string | null
  /** Fin de visibilidad programada (ISO) o null. */
  endsAt: string | null
  createdAt: string
  updatedAt: string
}

/** GLOBAL (barId null) vs LOCAL (bar específico). */
export type BannerScope = "global" | "local"

/**
 * Estado *calculado* que combina isActive + startsAt/endsAt.
 * Es lo que decide si el banner aparece en el carrusel público /banners/active.
 */
export type BannerComputedStatus = "active" | "scheduled" | "expired" | "inactive"

/** Filtros del listado admin (GET /banners?barId=&isActive=&isGlobal=). */
export type BannerListFilters = {
  /** Bar específico. Ignorado si scope = "global". */
  barId?: string
  scope?: BannerScope | "all"
  status?: BannerComputedStatus | "all"
  /** Búsqueda por título/descripción (client-side). */
  query?: string
}

/** Valores del formulario de alta/edición (sin la imagen, que va aparte). */
export type BannerFormValues = {
  title: string
  description: string
  /** null = global. */
  barId: string | null
  linkUrl: string
  displayOrder: number
  isActive: boolean
  /** datetime-local -> se serializa a ISO al enviar. */
  startsAt: string | null
  endsAt: string | null
}
