import { getBars, getPlatformKpis } from "@/lib/bares/api"
import { BaresKpis } from "@/components/bares/bares-kpis"
import { BaresScreen } from "@/components/bares/bares-screen"

export default async function BaresPage() {
  const [bars, kpis] = await Promise.all([getBars(), getPlatformKpis()])

  return (
    <>
      <BaresKpis bars={bars} kpis={kpis} />
      <BaresScreen bars={bars} />
    </>
  )
}
