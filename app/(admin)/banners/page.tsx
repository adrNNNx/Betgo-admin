import { getBannerBars, listBanners } from "@/lib/banners/api"
import { BannersManager } from "@/components/banners/banners-manager"

export default async function BannersPage() {
  const [banners, bars] = await Promise.all([listBanners(), getBannerBars()])

  return <BannersManager banners={banners} bars={bars} />
}
