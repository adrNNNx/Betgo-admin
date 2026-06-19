import { logout } from "@/app/login/actions"
import { Button } from "@/components/ui/button"

// ponytail: placeholder. El layout y los módulos reales vienen después; esto solo
// prueba que el login redirige a una ruta protegida y que el logout funciona.
export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-semibold">Betgo Admin · Dashboard</h1>
      <form action={logout}>
        <Button type="submit" variant="outline">
          Cerrar sesión
        </Button>
      </form>
    </main>
  )
}
