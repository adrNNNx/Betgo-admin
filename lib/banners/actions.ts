"use server"

import { revalidatePath } from "next/cache"

import { apiFetch } from "@/lib/session"
import type { BannerFormValues } from "@/lib/banners/types"

/** Llama al backend; tira con el mensaje del backend si falla (ej. startsAt < endsAt). */
async function send(path: string, init: RequestInit): Promise<Response> {
  const res = await apiFetch(path, init)
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { message?: unknown } | null
    const msg = data?.message
    throw new Error(
      Array.isArray(msg)
        ? msg.join(", ")
        : typeof msg === "string"
          ? msg
          : "La operación falló"
    )
  }
  return res
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
})

const revalidate = () => revalidatePath("/banners")

/**
 * Alta de banner (POST /banners, multipart con la imagen). El `isActive=false`
 * no viaja fiable en multipart (@Type(Boolean) lo interpreta como true), así que
 * se crea activo y si se pidió inactivo se togglea acto seguido.
 */
export async function createBanner(formData: FormData, inactive: boolean) {
  const res = await send("/banners", { method: "POST", body: formData })
  if (inactive) {
    const created = (await res.json()) as { id: string }
    await send(`/banners/${created.id}/toggle`, { method: "PATCH" })
  }
  revalidate()
}

/** Edición de metadatos (PATCH /banners/:id). La imagen se cambia aparte. */
export async function updateBanner(id: string, values: BannerFormValues) {
  await send(
    `/banners/${id}`,
    jsonInit("PATCH", {
      title: values.title,
      description: values.description || null,
      barId: values.barId,
      linkUrl: values.linkUrl || null,
      displayOrder: values.displayOrder,
      isActive: values.isActive,
      startsAt: values.startsAt,
      endsAt: values.endsAt,
    })
  )
  revalidate()
}

/** Reemplaza solo la imagen (PATCH /banners/:id/image, multipart). */
export async function replaceBannerImage(id: string, formData: FormData) {
  await send(`/banners/${id}/image`, { method: "PATCH", body: formData })
  revalidate()
}

/** Activa / desactiva un banner (PATCH /banners/:id/toggle). */
export async function toggleBanner(id: string) {
  await send(`/banners/${id}/toggle`, { method: "PATCH" })
  revalidate()
}

/** Elimina un banner (y su imagen en Cloudinary la limpia el backend). */
export async function deleteBanner(id: string) {
  await send(`/banners/${id}`, { method: "DELETE" })
  revalidate()
}

/** Reordena intercambiando el displayOrder de dos banners del mismo carrusel. */
export async function reorderBanners(
  updates: { id: string; displayOrder: number }[]
) {
  await Promise.all(
    updates.map((u) =>
      send(`/banners/${u.id}`, jsonInit("PATCH", { displayOrder: u.displayOrder }))
    )
  )
  revalidate()
}
