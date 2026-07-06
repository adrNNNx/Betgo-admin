import type { IdentifierKind } from "@/lib/staff/types"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+\d][\d\s().-]{5,}$/

/** Detecta si el identificador es email, teléfono o un ID externo de acceso. */
export function identifierKind(value: string): IdentifierKind {
  const v = value.trim()
  if (EMAIL_RE.test(v)) return "email"
  if (PHONE_RE.test(v)) return "phone"
  return "external"
}

export const IDENTIFIER_META: Record<
  IdentifierKind,
  { label: string; icon: string }
> = {
  email: { label: "Correo electrónico", icon: "Mail" },
  phone: { label: "Teléfono", icon: "Phone" },
  external: { label: "ID de acceso", icon: "Fingerprint" },
}

/** Iniciales para el avatar: "Ricardo Samudio" -> "RS". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

/** Color estable del avatar derivado del nombre (sin librerías). */
export function avatarColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  const hue = Math.abs(hash) % 360
  return `oklch(0.55 0.14 ${hue})`
}
