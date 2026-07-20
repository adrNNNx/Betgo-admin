import "server-only"

import { apiFetch } from "@/lib/session"
import { getBars } from "@/lib/bares/api"
import type { Banner, BannerBarRef } from "@/lib/banners/types"

/**
 * Listado admin de banners (GET /banners). El backend ya devuelve cada banner
 * con su bar incluido `{id, name, slug}` y ordenado por alcance + displayOrder.
 */
export async function listBanners(): Promise<Banner[]> {
  const res = await apiFetch("/banners")
  if (!res.ok) throw new Error("No se pudieron cargar los banners")
  return (await res.json()) as Banner[]
}

/** Bares para el selector de alcance. Reusa el endpoint real de bares. */
export async function getBannerBars(): Promise<BannerBarRef[]> {
  const bars = await getBars()
  return bars.map((b) => ({ id: b.id, name: b.name, slug: b.slug }))
}
