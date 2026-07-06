import { HandPlatter, ClipboardList, Shield } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { STAFF_ROLE } from "@/config/staff"
import type { StaffRole } from "@/lib/staff/types"
import { cn } from "@/lib/utils"

const ROLE_ICON: Record<StaffRole, LucideIcon> = {
  mozo: HandPlatter,
  encargado: ClipboardList,
  admin_bar: Shield,
}

export function StaffRoleCell({ role }: { role: StaffRole }) {
  const meta = STAFF_ROLE[role]
  const Icon = ROLE_ICON[role]
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium">
      <span
        className={cn(
          "grid size-6 place-items-center rounded-sm",
          meta.chipClassName
        )}
      >
        <Icon className="size-3.5" />
      </span>
      {meta.label}
    </span>
  )
}
