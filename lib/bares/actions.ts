"use server"

import { revalidatePath } from "next/cache"

import { apiFetch } from "@/lib/session"
import type { Distribution } from "@/lib/bares/types"

export type BarFormInput = {
  id?: string
  name: string
  location: string
  distribution: Distribution
}

/** Llama al backend; tira con el mensaje del backend si falla. Devuelve la Response. */
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

// Multipart con el campo `file` que esperan los endpoints de imagen. Sin
// Content-Type manual: fetch arma el boundary solo.
const fileInit = (method: string, file: File): RequestInit => {
  const fd = new FormData()
  fd.append("file", file)
  return { method, body: fd }
}

export async function saveBar(input: BarFormInput) {
  const body = {
    name: input.name,
    address: input.location || undefined,
    barPercentage: input.distribution.bar,
    poolPercentage: input.distribution.pozo,
    platformPercentage: input.distribution.empresa,
  }
  await send(
    input.id ? `/bars/${input.id}` : "/bars",
    jsonInit(input.id ? "PATCH" : "POST", body)
  )
  revalidatePath("/bares")
}

export async function rechargeBalance(
  barId: string,
  amount: number,
  notes?: string
) {
  await send(`/bars/${barId}/recharge`, jsonInit("POST", { amount, notes }))
  revalidatePath("/bares")
}

export async function setFreePlays(barId: string, value: number) {
  await send(
    `/bars/${barId}/free-plays`,
    jsonInit("PATCH", { freePlaysPerDay: value })
  )
  revalidatePath("/bares")
}

export async function setBarImage(barId: string, formData: FormData) {
  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Seleccioná una imagen.")
  }
  // PATCH multipart → Cloudinary (lo maneja el backend).
  await send(`/bars/${barId}/logo`, fileInit("PATCH", file))
  revalidatePath("/bares")
}

export async function setBarActive(barId: string, isActive: boolean) {
  // Activar/desactivar = PATCH del flag isActive. No se elimina el bar.
  await send(`/bars/${barId}`, jsonInit("PATCH", { isActive }))
  revalidatePath("/bares")
}

export async function saveSymbol(barId: string, formData: FormData) {
  const id = formData.get("id")
  const name = String(formData.get("name") ?? "").trim()
  const weight = Number(formData.get("weight")) || 100
  const fileEntry = formData.get("file")
  const file =
    fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null

  if (typeof id === "string" && id) {
    // Editar: datos por JSON; la imagen sólo si eligieron una nueva.
    await send(`/symbols/${id}`, jsonInit("PATCH", { name, weight }))
    if (file) await send(`/symbols/${id}/image`, fileInit("PATCH", file))
  } else {
    // Crear: el símbolo es LOCAL del bar (barId presente → isJackpot=false).
    if (!file) throw new Error("Subí una imagen para el símbolo.")
    // ponytail: el POST exige imageUrl (NOT NULL); mandamos un placeholder y la
    // imagen real va por PATCH /image acto seguido. Si el backend hiciera
    // imageUrl opcional en create, este placeholder se podría borrar.
    const res = await send(
      "/symbols",
      jsonInit("POST", { name, weight, barId, imageUrl: "pending-upload" })
    )
    const created = (await res.json()) as { id: string }
    await send(`/symbols/${created.id}/image`, fileInit("PATCH", file))
  }
  revalidatePath("/bares")
}

export async function deleteSymbol(barId: string, symbolId: string) {
  // Backend hace hard-delete del símbolo.
  void barId
  await send(`/symbols/${symbolId}`, { method: "DELETE" })
  revalidatePath("/bares")
}
