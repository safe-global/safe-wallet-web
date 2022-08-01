import { SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { useState, type ReactElement } from 'react'
import NftTransferModal from '../tx/modals/NftTransferModal'
import NftGrid from './NftGrid'

const Nfts = ({ collectibles }: { collectibles: SafeCollectibleResponse[] }): ReactElement => {
  const [sendNft, setSendNft] = useState<SafeCollectibleResponse | null>(null)

  return (
    <>
      <NftGrid collectibles={collectibles} onSendClick={(nft) => setSendNft(nft)} />

      {sendNft && (
        <NftTransferModal
          onClose={() => setSendNft(null)}
          initialData={[
            {
              recipient: '',
              tokenAddress: sendNft.address,
              tokenId: sendNft.id,
            },
          ]}
        />
      )}
    </>
  )
}

export default Nfts
