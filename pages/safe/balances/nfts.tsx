import type { NextPage } from 'next'

import useCollectibles from '@/services/useCollectibles'
import { NftGrid } from '@/components/nfts'

const NFTs: NextPage = () => {
  const { collectibles } = useCollectibles()

  return (
    <main>
      <h2>NFTs</h2>
      <NftGrid collectibles={collectibles} />
    </main>
  )
}

export default NFTs
