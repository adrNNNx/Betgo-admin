import { getBarsWithReel, getPlatformKpis } from "@/lib/bares/api"
import { BaresKpis } from "@/components/bares/bares-kpis"
import { BaresScreen } from "@/components/bares/bares-screen"

export default async function BaresPage() {
  const [{ bars, globalSymbols }, kpis] = await Promise.all([
    getBarsWithReel(),
    getPlatformKpis(),
  ])

  return (
    <>
      <BaresKpis bars={bars} kpis={kpis} />
      <BaresScreen bars={bars} globalSymbols={globalSymbols} />
    </>
  )
}
