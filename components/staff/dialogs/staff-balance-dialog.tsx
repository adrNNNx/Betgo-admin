"use client"

import { useEffect, useState, useTransition } from "react"
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react"

import type { StaffMember } from "@/lib/staff/types"
import { rechargeStaffBalance, returnStaffBalance } from "@/lib/staff/actions"
import { withToast } from "@/lib/run-action"
import { formatGs } from "@/lib/format"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { NumberInput } from "@/components/ui/number-input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type Direction = "allocate" | "return"

/**
 * Asigna saldo del bar al mozo, o se lo devuelve al bar. El monto se transfiere
 * (el saldo del bar es el tope al asignar; el del mozo, al devolver).
 */
export function StaffBalanceDialog({
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
  const [direction, setDirection] = useState<Direction>("allocate")
  const [amount, setAmount] = useState<number | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      setDirection("allocate")
      setAmount(null)
    }
  }, [open])

  if (!member) return null

  const noBar = member.barId === null
  const barBalance = member.barBalance ?? 0
  const cap = direction === "allocate" ? barBalance : member.balance
  const amt = amount ?? 0
  const result =
    direction === "allocate" ? member.balance + amt : member.balance - amt
  const overCap = amt > cap
  const canApply = amt > 0 && !overCap && !noBar && !pending

  const submit = () => {
    startTransition(async () => {
      const ok = await withToast(
        () =>
          direction === "allocate"
            ? rechargeStaffBalance(member.id, amt)
            : returnStaffBalance(member.id, amt),
        direction === "allocate" ? "Saldo asignado al mozo" : "Saldo devuelto al bar"
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
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="size-4 text-muted-foreground" />
            Saldo de {member.name}
          </DialogTitle>
          <DialogDescription>
            {noBar
              ? "Este miembro no tiene un bar asignado, así que no se le puede transferir saldo."
              : "El saldo se transfiere entre el bar y el mozo. El mozo carga a los usuarios desde su saldo."}
          </DialogDescription>
        </DialogHeader>

        {!noBar && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-secondary px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Saldo del mozo</p>
                <p className="text-lg font-bold tabular-nums">{formatGs(member.balance)}</p>
              </div>
              <div className="rounded-lg bg-secondary px-3 py-2.5">
                <p className="text-xs text-muted-foreground">
                  Disponible en {member.barName}
                </p>
                <p className="text-lg font-bold tabular-nums">{formatGs(barBalance)}</p>
              </div>
            </div>

            <ToggleGroup
              type="single"
              value={direction}
              onValueChange={(v) => {
                if (!v) return
                setDirection(v as Direction)
                setAmount(null)
              }}
              variant="outline"
              className="w-full"
            >
              <ToggleGroupItem value="allocate" className="flex-1">
                <ArrowUpRight className="size-4" />
                Asignar al mozo
              </ToggleGroupItem>
              <ToggleGroupItem value="return" className="flex-1">
                <ArrowDownLeft className="size-4" />
                Devolver al bar
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="staff-amount">Monto (PYG)</Label>
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                  onClick={() => setAmount(cap || null)}
                >
                  Máx. {formatGs(cap)}
                </button>
              </div>
              <NumberInput
                id="staff-amount"
                value={amount}
                onValueChange={setAmount}
                max={cap}
                placeholder="0"
                className="tabular-nums"
              />
              <p className="text-xs text-muted-foreground">
                Nuevo saldo del mozo:{" "}
                <strong className="text-foreground tabular-nums">{formatGs(result)}</strong>
              </p>
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {noBar ? "Cerrar" : "Cancelar"}
          </Button>
          {!noBar && (
            <Button onClick={submit} disabled={!canApply}>
              {direction === "allocate" ? "Asignar saldo" : "Devolver saldo"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
