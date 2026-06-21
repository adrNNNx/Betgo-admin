import { MOCK_BARS } from "@/lib/bares/data"
import { BaresKpis } from "@/components/bares/bares-kpis"
import { BaresManager } from "@/components/bares/bares-manager"
import { BarSymbols } from "@/components/bares/bar-symbols"

// ponytail: cuando el backend esté listo, reemplazá MOCK_BARS por el fetch:
//   const bars = await getBars()  // server-side, con la cookie de sesión
export default async function BaresPage() {
  const bars = MOCK_BARS

  return (
    <>
      <BaresKpis bars={bars} />
      <BaresManager bars={bars} />
      <BarSymbols bars={bars} />
    </>
  )
}
