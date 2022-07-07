import type { NextPage } from 'next'
import { useAppSelector } from '@/store'
import { selectCollectibles } from '@/store/collectiblesSlice'
import { NftGrid } from '@/components/nfts'

const NFTs: NextPage = () => {
  const { data } = useAppSelector(selectCollectibles)

  return (
    <main>
      <h2>NFTs</h2>
      <NftGrid collectibles={data} />
    </main>
  )
}

export default NFTs
