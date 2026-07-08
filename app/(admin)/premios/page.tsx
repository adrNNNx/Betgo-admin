import { getScopes } from "@/lib/premios/api"
import { summarize } from "@/lib/premios/helpers"
import { PremiosKpis } from "@/components/premios/premios-kpis"
import { PremiosManager } from "@/components/premios/premios-manager"

export default async function PremiosPage() {
  const scopes = await getScopes()

  return (
    <>
      <PremiosKpis summary={summarize(scopes)} />
      <PremiosManager scopes={scopes} />
    </>
  )
}
