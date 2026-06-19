import { redirect } from "next/navigation"

// Middleware se encarga de mandar a /login si no hay sesión.
export default function Home() {
  redirect("/dashboard")
}
