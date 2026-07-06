"use client"

import { useEffect, useState, useTransition } from "react"
import { Mail, Phone, Fingerprint } from "lucide-react"

import type { BarRef, StaffMember, StaffRole, StaffStatus } from "@/lib/staff/types"
import { ROLE_OPTIONS, STATUS_OPTIONS, STAFF_ROLE, STAFF_STATUS } from "@/config/staff"
import { identifierKind } from "@/lib/staff/identifier"
import { saveStaff } from "@/lib/staff/actions"
import { withToast } from "@/lib/run-action"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const IDENT_ICON = { email: Mail, phone: Phone, external: Fingerprint }

export function StaffFormDialog({
  open,
  member,
  bars,
  onClose,
}: {
  open: boolean
  member: StaffMember | null
  bars: BarRef[]
  onClose: () => void
}) {
  const isEdit = Boolean(member)
  const [name, setName] = useState("")
  const [identifier, setIdentifier] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [barId, setBarId] = useState<string>("")
  const [role, setRole] = useState<StaffRole>("mozo")
  const [status, setStatus] = useState<StaffStatus>("active")
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    setName(member?.name ?? "")
    setIdentifier(member?.identifier ?? "")
    setEmail("")
    setPassword("")
    setBarId(member?.barId ?? bars[0]?.id ?? "")
    setRole(member?.role ?? "mozo")
    setStatus(member?.status ?? "active")
  }, [open, member, bars])

  const IdentIcon = IDENT_ICON[identifierKind(identifier || "x")]
  const valid =
    name.trim().length > 0 && (isEdit || identifier.trim().length > 0)

  const submit = () => {
    startTransition(async () => {
      const ok = await withToast(
        () =>
          saveStaff({
            id: member?.id,
            name: name.trim(),
            identifier: identifier.trim(),
            barId: barId || null,
            role,
            status,
            email: email.trim() || undefined,
            password: password || undefined,
          }),
        isEdit ? "Staff actualizado" : "Staff creado"
      )
      if (ok) onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar staff" : "Nuevo staff"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos del miembro del staff."
              : "Agrega un miembro y define su rol y acceso."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="staff-name">Nombre completo</Label>
            <Input
              id="staff-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Ricardo Samudio"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="staff-ident">Identificador</Label>
            <div className="relative">
              <IdentIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="staff-ident"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                readOnly={isEdit}
                placeholder="correo@ejemplo.com"
                className="pl-8 read-only:bg-muted read-only:text-muted-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? "El identificador no se puede modificar."
                : "Email, teléfono o ID de acceso. Se usa para iniciar sesión."}
            </p>
          </div>

          {/* Solo alta: si el usuario todavía no existe, el backend lo crea con
              estos datos (identificador debe ser un teléfono). */}
          {!isEdit && (
            <div className="grid gap-3 rounded-lg border border-dashed p-3">
              <p className="text-xs text-muted-foreground">
                Si la persona aún no tiene cuenta, completá una contraseña para
                crearla (el identificador debe ser un teléfono). Si ya existe,
                dejalo vacío.
              </p>
              <div className="grid gap-2">
                <Label htmlFor="staff-email">
                  Email <span className="font-normal text-muted-foreground">(opcional)</span>
                </Label>
                <Input
                  id="staff-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-password">
                  Contraseña{" "}
                  <span className="font-normal text-muted-foreground">
                    (solo si es nuevo)
                  </span>
                </Label>
                <Input
                  id="staff-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="staff-bar">Bar asignado</Label>
            <Select value={barId} onValueChange={setBarId}>
              <SelectTrigger id="staff-bar" className="w-full">
                <SelectValue placeholder="Selecciona un bar" />
              </SelectTrigger>
              <SelectContent>
                {bars.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Podés reasignarlo más adelante desde la tabla.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="staff-role">Rol</Label>
              <Select value={role} onValueChange={(v) => setRole(v as StaffRole)}>
                <SelectTrigger id="staff-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {STAFF_ROLE[r].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="staff-status">Estado</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as StaffStatus)}
              >
                <SelectTrigger id="staff-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STAFF_STATUS[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!valid || pending}>
            {isEdit ? "Guardar cambios" : "Crear staff"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
