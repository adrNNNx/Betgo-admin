"use server"

import { revalidatePath } from "next/cache"

import { apiFetch } from "@/lib/session"
import type { StaffRole, StaffStatus } from "@/lib/staff/types"

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

export type StaffFormInput = {
  id?: string
  name: string
  /** En alta es el login (email/tel/ID); en edición el backend lo ignora. */
  identifier: string
  barId: string | null
  role: StaffRole
  status: StaffStatus
  /** Solo alta de un usuario que aún no existe (el backend exige tel + password). */
  email?: string
  password?: string
}

/**
 * Alta / edición de un miembro del staff.
 *  - Alta (POST /staff): vincula un usuario existente por `identifier`, o crea
 *    uno nuevo si se manda `password` (con identifier tipo teléfono).
 *  - Edición (PATCH /staff/:id): actualiza nombre, bar, rol y estado.
 */
export async function saveStaff(input: StaffFormInput) {
  if (input.id) {
    await send(
      `/staff/${input.id}`,
      jsonInit("PATCH", {
        name: input.name,
        barId: input.barId,
        role: input.role,
        status: input.status,
      })
    )
  } else {
    await send(
      "/staff",
      jsonInit("POST", {
        identifier: input.identifier,
        role: input.role,
        barId: input.barId ?? undefined,
        name: input.name || undefined,
        email: input.email || undefined,
        password: input.password || undefined,
      })
    )
  }
  revalidatePath("/mozos")
}

/** Cambia el estado de acceso de un miembro (PATCH /staff/:id { status }). */
export async function setStaffStatus(staffId: string, status: StaffStatus) {
  await send(`/staff/${staffId}`, jsonInit("PATCH", { status }))
  revalidatePath("/mozos")
}
