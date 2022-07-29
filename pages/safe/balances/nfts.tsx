import type { NextPage } from 'next'
import useCollectibles from '@/hooks/useCollectibles'
import { NftGrid } from '@/components/nfts'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import AssetsIcon from '@/public/images/sidebar/assets.svg'
import NavTabs from '@/components/common/NavTabs'
import { balancesNavItems } from '@/components/sidebar/SidebarNavigation/config'

const NFTs: NextPage = () => {
  const { collectibles } = useCollectibles()

  return (
    <main>
      <Breadcrumbs Icon={AssetsIcon} first="Assets" second="NFTs" />

      <NavTabs tabs={balancesNavItems} />

      <NftGrid collectibles={collectibles} />
    </main>
  )
}

export default NFTs
