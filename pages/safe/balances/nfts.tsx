import type { NextPage } from 'next'

import useCollectibles from '@/hooks/useCollectibles'
import { NftGrid } from '@/components/nfts'

const NFTs: NextPage = () => {
  const { data } = useCollectibles()

  return (
    <main>
      <h2>NFTs</h2>
      <NftGrid collectibles={data || []} />
    </main>
  )
}

export default NFTs
