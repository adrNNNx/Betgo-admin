"use server"

import { revalidatePath } from "next/cache"

import type { BarSymbol, Distribution } from "@/lib/bares/types"

/**
 * ponytail: Server Actions del módulo Bares.
 * Cada una debe llamar al backend (fetch a Betgo-backend con la cookie de
 * sesión) y luego revalidar la ruta. Hoy son stubs con TODO.
 */

export type BarFormInput = {
  id?: string
  name: string
  location: string
  distribution: Distribution
}

export async function saveBar(input: BarFormInput) {
  // TODO: POST/PUT /bares
  console.log("saveBar", input)
  revalidatePath("/bares")
}

export async function rechargeBalance(barId: string, amount: number, notes?: string) {
  // TODO: POST /bares/:id/recargas
  console.log("rechargeBalance", { barId, amount, notes })
  revalidatePath("/bares")
}

export async function setFreePlays(barId: string, value: number) {
  // TODO: PATCH /bares/:id { freePlaysPerDay }
  console.log("setFreePlays", { barId, value })
  revalidatePath("/bares")
}

export async function setBarImage(barId: string, formData: FormData) {
  // TODO: subir archivo (formData.get("image")) y guardar URL
  console.log("setBarImage", barId, formData.get("image"))
  revalidatePath("/bares")
}

export async function removeBarImage(barId: string) {
  // TODO: DELETE imagen -> vuelve a SELO.png
  console.log("removeBarImage", barId)
  revalidatePath("/bares")
}

export async function deleteBar(barId: string) {
  // TODO: DELETE /bares/:id
  console.log("deleteBar", barId)
  revalidatePath("/bares")
}

export async function saveSymbol(barId: string, symbol: Omit<BarSymbol, "id"> & { id?: string }) {
  // TODO: POST/PUT símbolo del bar
  console.log("saveSymbol", barId, symbol)
  revalidatePath("/bares")
}

export async function deleteSymbol(barId: string, symbolId: string) {
  // TODO: DELETE símbolo
  console.log("deleteSymbol", { barId, symbolId })
  revalidatePath("/bares")
}
