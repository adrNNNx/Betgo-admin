"use client"

import { createContext, useContext } from "react"

import { canAccess, type Role, type SessionUser } from "@/lib/auth"

// Sesión para componentes cliente. El usuario lo resuelve el server (RSC) y lo
// inyecta una sola vez en el layout; acá sólo se lee. No guarda tokens.
const SessionContext = createContext<SessionUser | null>(null)

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser
  children: React.ReactNode
}) {
  return (
    <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
  )
}

export function useSession(): SessionUser {
  const user = useContext(SessionContext)
  if (!user) {
    throw new Error("useSession debe usarse dentro de <SessionProvider>")
  }
  return user
}

/** Muestra `children` sólo si el rol actual está permitido. Para gating de UI. */
export function RoleGate({
  roles,
  children,
  fallback = null,
}: {
  roles: Role[]
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const user = useSession()
  return <>{canAccess(user.role, roles) ? children : fallback}</>
}
