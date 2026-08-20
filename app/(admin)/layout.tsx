import { redirect } from "next/navigation"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { SessionProvider } from "@/components/session-provider"
import { EXPIRED_PARAM } from "@/lib/auth"
import { getSessionUser } from "@/lib/session"

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

  return (
    <SessionProvider user={user}>
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  )
}
