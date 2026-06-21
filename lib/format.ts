/** Formatea un monto en guaraníes: 140000 -> "Gs. 140.000" */
export function formatGs(value: number): string {
  return `Gs. ${new Intl.NumberFormat("es-PY").format(value)}`
}

/** Solo el número con separadores de miles: 140000 -> "140.000" */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-PY").format(value)
}

/** "Bar Central" -> "bar-central" (sin acentos ni símbolos) */
export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "nuevo-bar"
  )
}
