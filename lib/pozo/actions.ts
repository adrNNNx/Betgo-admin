"use server"

import { revalidatePath } from "next/cache"

import { apiFetch } from "@/lib/session"
import {
  getJackpotClaims,
  getMajorClaims,
  getMovementsPage,
  type JackpotClaimsPage,
  type MajorClaimsPage,
  type MovementCategory,
  type MovementsPage,
} from "@/lib/pozo/api"
import type {
  AdjustDirection,
  ClaimStatus,
  JackpotClaimStatus,
} from "@/lib/pozo/types"

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
 * Pozos ganados. `status` undefined = la vista "Pendientes", que junta
 * `pending_contact` e `in_review`: es lo que le falta resolver al admin.
 *
 * ponytail: el backend filtra por UN estado, así que para esa vista pedimos los
 * dos y ordenamos acá. Techo: 200 por estado (el tope del endpoint). Llegar ahí
 * significaría 200 pozos sin pagar, un problema bastante más grave que la
 * paginación. Si algún día hace falta, pedir `?status=pending` al backend.
 */
export async function fetchJackpotClaims(params: {
  status?: JackpotClaimStatus
  limit: number
  offset: number
}): Promise<JackpotClaimsPage> {
  if (params.status) return getJackpotClaims(params)

  const [sinContactar, enRevision] = await Promise.all([
    getJackpotClaims({ status: "pending_contact", limit: 200, offset: 0 }),
    getJackpotClaims({ status: "in_review", limit: 200, offset: 0 }),
  ])
  const data = [...sinContactar.data, ...enRevision.data].sort(
    (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
  )
  return {
    data: data.slice(params.offset, params.offset + params.limit),
    total: sinContactar.total + enRevision.total,
  }
}

/**
 * Marca un pozo como pagado (POST /jackpot-claims/:folio/pay).
 *
 * IRREVERSIBLE: no hay endpoint para deshacerlo y el monto se suma a
 * `total_paid` del pozo global. Los errores del backend (ya pagado, folio
 * inexistente, admin sin perfil de staff) suben tal cual para mostrarlos.
 */
export async function markJackpotPaid(folio: string, notes?: string) {
  await send(
    `/jackpot-claims/${encodeURIComponent(folio)}/pay`,
    jsonInit("POST", { notes: notes?.trim() || undefined })
  )
  revalidatePath("/pozo")
  // El badge vive en el layout: sin esto seguiría mostrando el pozo ya pagado.
  revalidatePath("/", "layout")
}

/** Trae una página de premios mayores (para los filtros del cliente). */
export async function fetchMajorClaims(params: {
  status: ClaimStatus
  barId?: string
  limit: number
  offset: number
}): Promise<MajorClaimsPage> {
  return getMajorClaims(params)
}

/**
 * Entrega un premio mayor (POST /prize-claims/major/deliver).
 *
 * IRREVERSIBLE: no hay endpoint para deshacerla. El claim queda `delivered` y
 * el stock del premio baja. Los errores del backend (ya entregado, vencido,
 * premio local, admin sin perfil de staff) suben tal cual para mostrarlos.
 */
export async function deliverMajorPrize(code: string, notes?: string) {
  await send(
    "/prize-claims/major/deliver",
    jsonInit("POST", { code, notes: notes?.trim() || undefined })
  )
  revalidatePath("/pozo")
}

/**
 * Desde cuántos iguales paga este símbolo (PATCH /symbols/:id).
 * 3 o 4 = premio menor; 5 = sólo con los cinco carriles.
 */
export async function setSymbolMinMatch(symbolId: string, value: 3 | 4 | 5) {
  await send(`/symbols/${symbolId}`, jsonInit("PATCH", { minMatchToWin: value }))
  revalidatePath("/pozo")
}

/**
 * Marca (o desmarca) al símbolo que entrega el pozo global (PATCH /symbols/:id).
 *
 * Al activarlo van los tres campos juntos porque el backend valida el estado
 * final: un símbolo que entrega el pozo no puede tener premio propio y siempre
 * exige los 5. Mandar sólo el flag sobre un símbolo con premio da 400, así que
 * el premio se limpia en la misma llamada (el diálogo lo avisa antes).
 */
export async function setSymbolJackpot(symbolId: string, isJackpot: boolean) {
  const body = isJackpot
    ? { isJackpot: true, prizeId: null, minMatchToWin: 5 }
    : { isJackpot: false }
  await send(`/symbols/${symbolId}`, jsonInit("PATCH", body))
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
