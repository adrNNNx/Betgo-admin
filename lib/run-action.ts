"use client"

import { toast } from "sonner"

/**
 * Corre una server action mostrando feedback al usuario:
 * - éxito → toast verde con `successMsg`
 * - error → toast rojo con el mensaje del backend (las actions lanzan Error)
 *
 * Devuelve true/false para que el llamador decida si cerrar el diálogo
 * (no se cierra si falló, así el usuario corrige sin reabrir).
 */
export async function withToast(
  run: () => Promise<unknown>,
  successMsg: string
): Promise<boolean> {
  try {
    await run()
    toast.success(successMsg)
    return true
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Ocurrió un error inesperado.")
    return false
  }
}
