import type { NextPage } from 'next'
import useCollectibles from '@/hooks/useCollectibles'
import { NftGrid } from '@/components/nfts'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import AssetsIcon from '@/public/images/sidebar/assets.svg'

const NFTs: NextPage = () => {
  const { collectibles } = useCollectibles()

  return (
    <main>
      <Breadcrumbs Icon={AssetsIcon} first="Assets" second="NFTs" />
      <NftGrid collectibles={collectibles} />
    </main>
  )
}

export default NFTs
