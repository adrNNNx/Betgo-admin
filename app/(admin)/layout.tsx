import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import type { SessionUser } from "@/components/layout/nav-user"

// ponytail: shell autenticado. Todas las rutas dentro de (admin) comparten
// sidebar + header. El estado abierto/cerrado del sidebar lo persiste shadcn
// en la cookie `sidebar_state` (lo lee SidebarProvider del lado del server).
//
// TODO: reemplazar este usuario fijo por la sesión real. Cuando el backend
// exponga /me, leelo acá (server component) y pasalo a AppSidebar.
const currentUser: SessionUser = {
  name: "Francis Perier",
  role: "Administrador",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar user={currentUser} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
