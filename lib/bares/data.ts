import type { Bar } from "@/lib/bares/types"

/**
 * ponytail: data de ejemplo para maquetar la UI.
 * Reemplazar por un fetch real al backend dentro de page.tsx
 * (server component) cuando estén los endpoints.
 */
export const MOCK_BARS: Bar[] = [
  {
    id: "1",
    name: "Kill kenny",
    slug: "kill-kenny",
    location: "Asunción, Villa Morra",
    balance: 140000,
    freePlaysPerDay: 3,
    distribution: { bar: 50, pozo: 30, empresa: 20 },
    status: "draft",
    imageUrl: null,
    symbols: [
      { id: "s1", name: "Seven", emoji: "🎰", weight: 1, hasPrize: false },
      { id: "s2", name: "Bar", emoji: "📊", weight: 1, hasPrize: true },
      { id: "s3", name: "Bell", emoji: "🔔", weight: 1, hasPrize: false },
    ],
  },
]
