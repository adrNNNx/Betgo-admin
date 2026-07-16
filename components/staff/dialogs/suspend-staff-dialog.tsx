"use client"

import { useTransition } from "react"
import { Ban, RotateCcw } from "lucide-react"

import type { StaffMember } from "@/lib/staff/types"
import { setStaffStatus } from "@/lib/staff/actions"
import { withToast } from "@/lib/run-action"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * Confirma suspender o reactivar el acceso de un miembro. Cuando el miembro ya
 * está suspendido, el diálogo se invierte a "Reactivar acceso".
 */
export function SuspendStaffDialog({
  open,
  member,
  onClose,
  onChanged,
}: {
  open: boolean
  member: StaffMember | null
  onClose: () => void
  onChanged: () => void
}) {
  const [pending, startTransition] = useTransition()
  const reactivate = member?.status === "suspended"

  const confirm = () => {
    if (!member) return
    startTransition(async () => {
      const ok = await withToast(
        () => setStaffStatus(member.id, reactivate ? "active" : "suspended"),
        reactivate ? "Acceso reactivado" : "Acceso suspendido"
      )
      if (!ok) return
      onChanged()
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-md",
                reactivate
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
                  : "bg-red-50 text-red-600 dark:bg-red-950/40"
              )}
            >
              {reactivate ? (
                <RotateCcw className="size-5" />
              ) : (
                <Ban className="size-5" />
              )}
            </span>
            <div className="space-y-1">
              <DialogTitle>
                {reactivate ? "Reactivar acceso" : "Suspender acceso"}
              </DialogTitle>
              <DialogDescription>
                {reactivate
                  ? "El miembro volverá a poder iniciar sesión en su panel."
                  : "El miembro no podrá iniciar sesión hasta que reactives su acceso."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {member && (
          <p className="text-sm">
            {reactivate ? (
              <>
                Vas a reactivar el acceso de <strong>{member.name}</strong>.
              </>
            ) : (
              <>
                Vas a suspender el acceso de <strong>{member.name}</strong>. Sus
                cargas previas se conservan.
              </>
            )}
          </p>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant={reactivate ? "default" : "destructive"}
            onClick={confirm}
            disabled={pending}
          >
            {reactivate ? <RotateCcw /> : <Ban />}
            {reactivate ? "Reactivar acceso" : "Suspender acceso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
