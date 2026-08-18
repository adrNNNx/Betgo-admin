export type ImageSize = { width: number; height: number }

/**
 * Umbrales para evaluar la imagen. Se reciben por parámetro en vez de leer la
 * config acá: mantiene este módulo puro (testeable sin bundler) y deja
 * `config/banners.ts` como única fuente de los valores.
 */
export type ImagePolicy = {
  ratio: number
  ratioTolerance: number
  minWidth: number
  idealKb: number
  maxMb: number
}

/**
 * Lee el ancho y alto reales de un archivo de imagen.
 * Libera el object URL pase lo que pase, así elegir diez archivos no deja diez
 * blobs colgados en memoria.
 */
export function readImageSize(file: File): Promise<ImageSize | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    const done = (size: ImageSize | null) => {
      URL.revokeObjectURL(url)
      resolve(size)
    }
    img.onload = () => done({ width: img.naturalWidth, height: img.naturalHeight })
    // Un archivo corrupto no debería romper el formulario: sin medidas
    // simplemente no avisamos nada sobre ellas.
    img.onerror = () => done(null)
    img.src = url
  })
}

/** "16:9", "4:1"… y si no simplifica lindo, "3.72:1". */
export function formatRatio(width: number, height: number): string {
  if (!width || !height) return "—"
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
  const g = gcd(Math.round(width), Math.round(height))
  const w = Math.round(width) / g
  const h = Math.round(height) / g
  if (w <= 40 && h <= 40) return `${w}:${h}`
  return `${(width / height).toFixed(2)}:1`
}

/**
 * Cuánto recorta `object-cover` al meter la imagen en una caja de otra relación.
 *
 * Si la imagen es más ancha que la caja se escala al alto y sobra ancho: se
 * corta de los costados. Si es más alta, al revés. Nunca deforma.
 */
export function cropOf(
  size: ImageSize,
  boxRatio: number
): { axis: "ancho" | "alto"; percent: number } {
  const ratio = size.width / size.height
  if (ratio >= boxRatio) {
    return { axis: "ancho", percent: (1 - boxRatio / ratio) * 100 }
  }
  return { axis: "alto", percent: (1 - ratio / boxRatio) * 100 }
}

export function formatWeight(bytes: number): string {
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)}KB`
  return `${(kb / 1024).toFixed(1)}MB`
}

export type ImageWarning = { id: string; message: string }

/**
 * Avisos sobre la imagen elegida. Son sugerencias, no bloqueos: a veces el
 * banner es un fondo con textura al que el recorte no le importa, y bloquear
 * sólo logra que el admin abandone el formulario.
 */
export function analyzeImage(
  size: ImageSize | null,
  sizeBytes: number,
  policy: ImagePolicy
): ImageWarning[] {
  const warnings: ImageWarning[] = []

  if (size) {
    const ratio = size.width / size.height
    const desvio = Math.abs(ratio - policy.ratio) / policy.ratio
    if (desvio > policy.ratioTolerance) {
      const { axis, percent } = cropOf(size, policy.ratio)
      warnings.push({
        id: "ratio",
        message:
          `Tu imagen es ${formatRatio(size.width, size.height)} y el banner es ` +
          `${formatRatio(policy.ratio, 1)}. Se va a recortar el ` +
          `${Math.round(percent)}% del ${axis}.`,
      })
    }

    if (size.width < policy.minWidth) {
      warnings.push({
        id: "resolucion",
        message:
          `La imagen mide ${size.width}px de ancho. Debajo de ${policy.minWidth}px ` +
          `se ve borrosa en celulares con pantalla retina.`,
      })
    }
  }

  return warnings
}
