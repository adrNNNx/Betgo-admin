import { redirect } from "next/navigation"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { SessionProvider } from "@/components/session-provider"
import { EXPIRED_PARAM } from "@/lib/auth"
import { getSessionUser } from "@/lib/session"
import { getJackpotPendingCount } from "@/lib/pozo/api"

// Shell autenticado. El estado abierto/cerrado del sidebar lo persiste shadcn en
// la cookie `sidebar_state`. El usuario se resuelve server-side y baja por props
// (sidebar) y por contexto (componentes cliente que gatean por rol).
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSessionUser()
  if (!user) {
    // El proxy sólo mira si la cookie EXISTE (validarla en cada request costaría
    // un viaje al backend por asset); acá se valida de verdad contra
    // /auth/profile. Con un token presente pero rechazado —secret rotado,
    // usuario borrado, base reseteada— las dos capas se contradicen: el proxy
    // manda /login → /dashboard y el layout /dashboard → /login, sin fin.
    //
    // No podemos borrar las cookies desde acá: un Server Component no puede
    // escribirlas. Le marcamos el caso al proxy, que sí puede, y ahí se cortan.
    redirect(`/login?${EXPIRED_PARAM}=1`)
  }

  // Se resuelve acá para que el badge esté en TODAS las pantallas: es la única
  // vía por la que un admin se entera de que alguien ganó el pozo (no hay mail
  // ni push). Sólo lo ve un admin: al resto el endpoint le da 403 y cae a 0.
  const jackpots =
    user.role === "admin"
      ? await getJackpotPendingCount()
      : { total: 0, pendingContact: 0, inReview: 0, amountOwed: 0 }

  return (
    <SessionProvider user={user}>
      <SidebarProvider>
        <AppSidebar user={user} pendingJackpots={jackpots.total} />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  )
}
