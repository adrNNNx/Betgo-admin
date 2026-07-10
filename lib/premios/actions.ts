"use server"

import { revalidatePath } from "next/cache"

import { apiFetch } from "@/lib/session"

/** Llama al backend; tira con el mensaje del backend si falla. */
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

// Los premios/símbolos globales (barId = null) se administran desde el módulo
// Pozo global, así que revalidamos ambas rutas ante cualquier cambio.
function revalidate() {
  revalidatePath("/premios")
  revalidatePath("/pozo")
}

// Lee los campos comunes del form del premio.
function readPrizeFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const valueRaw = String(formData.get("value") ?? "").trim()
  const value = valueRaw ? Number(valueRaw) : null
  const unlimited = formData.get("unlimited") === "true"
  const stock = unlimited ? null : Math.max(0, Number(formData.get("stock")) || 0)
  const status = String(formData.get("status") ?? "active")
  const fileEntry = formData.get("file")
  const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null
  return { name, description, value, stock, status, file }
}

/**
 * Alta de premio (POST /prizes, multipart para soportar imagen). El `type` lo
 * deriva el backend del ámbito: barId presente → local, ausente → jackpot.
 */
export async function createPrize(barId: string | null, formData: FormData) {
  const { name, description, value, stock, status, file } = readPrizeFields(formData)

  const fd = new FormData()
  fd.append("name", name)
  if (description) fd.append("description", description)
  if (barId) fd.append("barId", barId)
  if (value !== null) fd.append("value", String(value))
  if (stock !== null) fd.append("stock", String(stock)) // omitido = ilimitado
  if (file) fd.append("file", file)

  const res = await send("/prizes", { method: "POST", body: fd })
  // El backend crea activo por defecto; el flag booleano no viaja fiable en
  // multipart, así que si se pidió inactivo lo togglemos acto seguido.
  if (status === "inactive") {
    const created = (await res.json()) as { id: string }
    await send(`/prizes/${created.id}/toggle`, { method: "PATCH" })
  }
  revalidate()
}

/** Edición de premio (PATCH JSON) + imagen aparte si se subió una nueva. */
export async function updatePrize(id: string, formData: FormData) {
  const { name, description, value, stock, status, file } = readPrizeFields(formData)

  await send(
    `/prizes/${id}`,
    jsonInit("PATCH", {
      name,
      description: description || null,
      value,
      stock, // null = ilimitado
      isActive: status === "active",
    })
  )
  if (file) {
    const ifd = new FormData()
    ifd.append("file", file)
    await send(`/prizes/${id}/image`, { method: "PATCH", body: ifd })
  }
  revalidate()
}

/** Duplica un premio en el mismo ámbito (sin copiar la imagen). */
export async function duplicatePrize(
  barId: string | null,
  prize: { name: string; desc: string; value: number | null; stock: number | null }
) {
  const fd = new FormData()
  fd.append("name", `${prize.name} (copia)`)
  if (prize.desc) fd.append("description", prize.desc)
  if (barId) fd.append("barId", barId)
  if (prize.value !== null) fd.append("value", String(prize.value))
  if (prize.stock !== null) fd.append("stock", String(prize.stock))
  await send("/prizes", { method: "POST", body: fd })
  revalidate()
}

/** Activa / desactiva un premio (PATCH /prizes/:id/toggle). */
export async function togglePrize(id: string) {
  await send(`/prizes/${id}/toggle`, { method: "PATCH" })
  revalidate()
}

/** Elimina un premio (y su imagen en Cloudinary lo maneja el backend). */
export async function deletePrize(id: string) {
  await send(`/prizes/${id}`, { method: "DELETE" })
  revalidate()
}

/**
 * Asigna (o quita) el premio que otorga un símbolo. `prizeId = null` desasigna.
 * La relación vive en el símbolo (PATCH /symbols/:id { prizeId }).
 */
export async function assignSymbolPrize(symbolId: string, prizeId: string | null) {
  await send(`/symbols/${symbolId}`, jsonInit("PATCH", { prizeId }))
  revalidate()
}
