import { ShieldAlert } from "lucide-react"

import { getSessionUser } from "@/lib/session"
import { FreePlaysResetScreen } from "@/components/jugadas/free-plays-reset-screen"

export default async function JugadasGratisPage() {
  // El backend ya responde 403 a quien no es admin; esto evita mostrarle una
  // pantalla que no puede usar. El layout garantiza que hay sesión.
  const user = await getSessionUser()
  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center gap-2 py-24 text-center">
        <ShieldAlert className="size-7 text-muted-foreground" />
        <p className="font-medium">Acceso denegado</p>
        <p className="text-sm text-muted-foreground">
          Sólo un administrador puede devolver jugadas gratis.
        </p>
      </div>
    )
  }

  return (
    <div data-screen-label="Jugadas gratis" className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <FreePlaysResetScreen />
    </div>
  )
}
