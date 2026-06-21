import { redirect } from "next/navigation"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { SessionProvider } from "@/components/session-provider"
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
  if (!user) redirect("/login")

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
