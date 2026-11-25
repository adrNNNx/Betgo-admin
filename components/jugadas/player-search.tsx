"use client"

import { useEffect, useState } from "react"
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Phone,
  Search,
  UserSearch,
} from "lucide-react"

import type { Player, PlayerPage } from "@/lib/jugadas/types"
import { searchPlayers } from "@/lib/jugadas/actions"
import { displayName, formatLastLogin } from "@/lib/jugadas/format"
import { avatarColor, initials } from "@/lib/staff/identifier"
import {
  PLAYERS_PAGE_SIZE,
  PLAYER_SEARCH_DEBOUNCE_MS,
  PLAYER_SEARCH_MIN_CHARS,
} from "@/config/jugadas"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

type Resolved =
  | { key: string; ok: true; page: PlayerPage }
  | { key: string; ok: false; message: string }

export function PlayerSearch({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (player: Player) => void
}) {
  const [input, setInput] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [retry, setRetry] = useState(0)
  // Última respuesta recibida, con la búsqueda que la pidió. "Cargando" se
  // deriva de que la búsqueda actual todavía no tiene respuesta.
  const [resolved, setResolved] = useState<Resolved | null>(null)
  const [lastOk, setLastOk] = useState<PlayerPage | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(input.trim())
      setPage(0)
    }, PLAYER_SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [input])

  const active = search.length >= PLAYER_SEARCH_MIN_CHARS
  const key = `${search}\u0000${page}\u0000${retry}`

  useEffect(() => {
    if (!active) return
    let cancelled = false
    searchPlayers(search, page * PLAYERS_PAGE_SIZE, PLAYERS_PAGE_SIZE).then((res) => {
      if (cancelled) return
      if (res.ok) setLastOk(res.data)
      setResolved(
        res.ok ? { key, ok: true, page: res.data } : { key, ok: false, message: res.error }
      )
    })
    return () => {
      cancelled = true
    }
  }, [active, search, page, key])

  const current = active && resolved?.key === key ? resolved : null
  const loading = active && !current
  const errorMsg = current && !current.ok ? current.message : null
  // Mientras carga una página nueva se deja visible la anterior (atenuada).
  const shown = !active ? null : current?.ok ? current.page : loading ? lastOk : null
  const idle = !active
  const tooShort = input.trim().length > 0 && input.trim().length < PLAYER_SEARCH_MIN_CHARS

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="gap-1 border-b py-5">
        <CardTitle>Buscar jugador</CardTitle>
        <CardDescription>
          Por nombre, email o teléfono. El teléfono acepta cualquier formato
          (0981…, 981…, +595…) o un fragmento.
        </CardDescription>
      </CardHeader>

      <div className="border-b px-6 py-3.5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ej. Juan, 0981234567, 81234…"
            className="pl-8 pr-8"
            autoComplete="off"
            spellCheck={false}
            aria-label="Buscar jugador"
          />
          {loading && (
            <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        {tooShort && (
          <p className="mt-2 text-xs text-muted-foreground">
            Escribí al menos {PLAYER_SEARCH_MIN_CHARS} caracteres.
          </p>
        )}
      </div>

      <CardContent className="px-0 pb-0">
        {idle && (
          <EmptyHint
            icon={<UserSearch className="size-6" />}
            title="Buscá un jugador para empezar"
            text="Pedile el teléfono: es el dato que siempre sabe dictar."
          />
        )}

        {errorMsg && (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <AlertCircle className="size-6 text-destructive" />
            <div className="space-y-1">
              <p className="text-sm font-medium">No se pudo buscar</p>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setRetry((r) => r + 1)}>
              Reintentar
            </Button>
          </div>
        )}

        {loading && !shown && <ResultsSkeleton />}

        {shown && shown.total === 0 && (
          <EmptyHint
            icon={<Search className="size-6" />}
            title="No se encontraron jugadores"
            text="Revisá el número o probá con un fragmento del teléfono."
          />
        )}

        {shown && shown.total > 0 && (
          <Results
            page={shown}
            pageIndex={page}
            loading={loading}
            selectedId={selectedId}
            onSelect={onSelect}
            onPage={setPage}
          />
        )}
      </CardContent>
    </Card>
  )
}

function Results({
  page,
  pageIndex,
  loading,
  selectedId,
  onSelect,
  onPage,
}: {
  page: PlayerPage
  pageIndex: number
  loading: boolean
  selectedId: string | null
  onSelect: (p: Player) => void
  onPage: (n: number) => void
}) {
  const pageCount = Math.max(1, Math.ceil(page.total / PLAYERS_PAGE_SIZE))
  const from = pageIndex * PLAYERS_PAGE_SIZE + 1
  const to = Math.min(page.total, from + page.data.length - 1)

  return (
    <>
      <ul
        className={cn("divide-y transition-opacity", loading && "pointer-events-none opacity-60")}
        aria-busy={loading}
      >
        {page.data.map((p) => {
          const name = displayName(p.name)
          const selected = p.id === selectedId
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect(p)}
                aria-pressed={selected}
                className={cn(
                  "flex w-full items-center gap-3 px-6 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none",
                  selected && "bg-muted"
                )}
              >
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: avatarColor(p.phone) }}
                  aria-hidden
                >
                  {p.name ? initials(p.name) : <Phone className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn("truncate font-semibold", !p.name && "text-muted-foreground")}
                    >
                      {name}
                    </span>
                    {!p.isActive && (
                      <Badge variant="secondary" className="shrink-0">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-mono text-foreground/80">
                      <Phone className="size-3" />
                      {p.phone}
                    </span>
                    {p.email && <span className="truncate">{p.email}</span>}
                  </div>
                </div>
                <div className="hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
                  <div>Último ingreso</div>
                  <div className="tabular-nums text-foreground/80">
                    {formatLastLogin(p.lastLoginAt)}
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-3.5">
        <span className="text-xs tabular-nums text-muted-foreground">
          {from}–{to} de {page.total}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pageIndex === 0 || loading}
            onClick={() => onPage(Math.max(0, pageIndex - 1))}
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pageIndex >= pageCount - 1 || loading}
            onClick={() => onPage(pageIndex + 1)}
          >
            Siguiente
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </>
  )
}

function EmptyHint({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <span className="text-muted-foreground">{icon}</span>
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <div className="divide-y" aria-busy>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-6 py-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  )
}
