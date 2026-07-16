"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"

const nf = new Intl.NumberFormat("es-PY")

/** Cuántos dígitos hay antes de una posición del texto. */
function digitsBefore(text: string, pos: number): number {
  return text.slice(0, pos).replace(/\D/g, "").length
}

/** Posición en `text` justo después del dígito número `n`. */
function posAfterDigits(text: string, n: number): number {
  if (n <= 0) return 0
  let seen = 0
  for (let i = 0; i < text.length; i++) {
    if (/\d/.test(text[i])) {
      seen++
      if (seen === n) return i + 1
    }
  }
  return text.length
}

/**
 * Input numérico: solo acepta dígitos y muestra el número con separador de
 * miles (es-PY, ej. 30.000). No usa `type="number"` a propósito: en algunos
 * navegadores deja escribir letras y el valor queda vacío en silencio.
 *
 * Devuelve `null` cuando está vacío. Preserva la posición del cursor al
 * reformatear, así se puede editar en el medio del número sin saltos.
 */
function NumberInput({
  value,
  onValueChange,
  max,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  value: number | null
  onValueChange: (value: number | null) => void
  /** Tope superior; se recorta al escribir (ej. porcentajes con max=100). */
  max?: number
}) {
  const ref = React.useRef<HTMLInputElement>(null)
  const caret = React.useRef<number | null>(null)

  const display = value === null || Number.isNaN(value) ? "" : nf.format(value)

  // Restaura el cursor después de que React pinta el valor reformateado.
  React.useLayoutEffect(() => {
    if (caret.current !== null && ref.current) {
      ref.current.setSelectionRange(caret.current, caret.current)
      caret.current = null
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.currentTarget
    const typed = el.value
    const kept = digitsBefore(typed, el.selectionStart ?? typed.length)

    const digits = typed.replace(/\D/g, "")
    let next = digits === "" ? null : Number(digits)
    if (next !== null && max !== undefined) next = Math.min(next, max)

    onValueChange(next)
    caret.current = posAfterDigits(next === null ? "" : nf.format(next), kept)
  }

  return (
    <Input
      ref={ref}
      inputMode="numeric"
      autoComplete="off"
      value={display}
      onChange={handleChange}
      className={className}
      {...props}
    />
  )
}

export { NumberInput }
