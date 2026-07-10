"use server"

import { revalidatePath } from "next/cache"

import { apiFetch } from "@/lib/session"
import {
  getMovementsPage,
  type MovementCategory,
  type MovementsPage,
} from "@/lib/pozo/api"
import type { AdjustDirection } from "@/lib/pozo/types"

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

// Multipart con el campo `file` que esperan los endpoints de imagen.
const fileInit = (method: string, file: File): RequestInit => {
  const fd = new FormData()
  fd.append("file", file)
  return { method, body: fd }
}

export type ManualAdjustInput = {
  /** Monto siempre positivo; la dirección define el signo. */
  amount: number
  direction: AdjustDirection
  /** Motivo del ajuste (obligatorio en el backend). */
  notes: string
}

/**
 * Ajuste manual del pozo (suma/resta) dejando registro en el historial.
 * El backend recibe el delta con signo (POST /global-pool/adjust) y valida
 * que el pozo no quede en negativo.
 */
export async function applyManualAdjust(input: ManualAdjustInput) {
  const delta = input.direction === "add" ? input.amount : -input.amount
  await send("/global-pool/adjust", jsonInit("POST", { amount: delta, notes: input.notes }))
  revalidatePath("/pozo")
}

/** Trae una página del historial (para la paginación del cliente). */
export async function fetchMovements(params: {
  offset: number
  limit: number
  category: MovementCategory
  search: string
}): Promise<MovementsPage> {
  return getMovementsPage({
    limit: params.limit,
    offset: params.offset,
    category: params.category,
    search: params.search,
  })
}

/** Costo por tirada del pozo (PATCH /global-pool/:id { costPerPlay }). */
export async function setCostPerSpin(cost: number) {
  await send("/global-pool/1", jsonInit("PATCH", { costPerPlay: cost }))
  revalidatePath("/pozo")
}

/**
 * Alta / edición de un símbolo del pozo global (vía /symbols, barId = null →
 * el backend lo marca como global/jackpot). La imagen propia es lo principal;
 * el emoji es el fallback. Mismo patrón que los símbolos de bares.
 */
export async function saveSymbol(formData: FormData) {
  const id = formData.get("id")
  const name = String(formData.get("name") ?? "").trim()
  const weight = Number(formData.get("weight")) || 0
  const emoji = String(formData.get("emoji") ?? "").trim() || null
  const fileEntry = formData.get("file")
  const file =
    fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null

  if (typeof id === "string" && id) {
    // Editar: metadata por JSON. Imagen nueva (file) o emoji como fallback.
    const body: Record<string, unknown> = { name, weight }
    if (!file && emoji) body.imageUrl = emoji
    await send(`/symbols/${id}`, jsonInit("PATCH", body))
    if (file) await send(`/symbols/${id}/image`, fileInit("PATCH", file))
  } else {
    // Crear: barId omitido → símbolo global (isJackpot=true en el backend).
    if (!file && !emoji) {
      throw new Error("Subí una imagen o elegí un emoji para el símbolo.")
    }
    const res = await send(
      "/symbols",
      jsonInit("POST", {
        name,
        weight,
        imageUrl: emoji ?? "pending-upload",
      })
    )
    const created = (await res.json()) as { id: string }
    if (file) await send(`/symbols/${created.id}/image`, fileInit("PATCH", file))
  }
  revalidatePath("/pozo")
}

/** Elimina un símbolo del pozo global (DELETE /symbols/:id). */
export async function deleteSymbol(symbolId: string) {
  await send(`/symbols/${symbolId}`, { method: "DELETE" })
  revalidatePath("/pozo")
}
