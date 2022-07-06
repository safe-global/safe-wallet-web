import type { NextPage } from 'next'

import useCollectibles from '@/hooks/useCollectibles'
import { NftGrid } from '@/components/nfts'

const NFTs: NextPage = () => {
  const { data: collectibles } = useCollectibles()

  return (
    <main>
      <h2>NFTs</h2>
      {collectibles && <NftGrid collectibles={collectibles} />}
    </main>
  )
}

export default NFTs
