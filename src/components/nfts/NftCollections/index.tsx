import { type SyntheticEvent, type ReactElement, useCallback, useEffect, useState } from 'react'
import { type SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import ErrorMessage from '@/components/tx/ErrorMessage'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import NftIcon from '@/public/images/common/nft.svg'
import NftBatchModal from '@/components/tx/modals/NftBatchModal'
import useCollectibles from '@/hooks/useCollectibles'
import InfiniteScroll from '@/components/common/InfiniteScroll'
import { NFT_EVENTS } from '@/services/analytics/events/nfts'
import { trackEvent } from '@/services/analytics'
import NftGrid from '../NftGrid'
import NftSendForm from '../NftSendForm'
import NftPreviewModal from '../NftPreviewModal'

const NftCollections = (): ReactElement => {
  // Track the current NFT page url
  const [pageUrl, setPageUrl] = useState<string>()
  // Load NFTs from the backend
  const [nftPage, error, loading] = useCollectibles(pageUrl)
  // Keep all loaded NFTs in one big array
  const [allNfts, setAllNfts] = useState<SafeCollectibleResponse[]>([])
  // Selected NFTs
  const [selectedNfts, setSelectedNfts] = useState<SafeCollectibleResponse[]>([])
  // Modal open state
  const [showSendModal, setShowSendModal] = useState<boolean>(false)
  // Preview
  const [previewNft, setPreviewNft] = useState<SafeCollectibleResponse>()

  // On NFT preview click
  const onPreview = useCallback((token: SafeCollectibleResponse) => {
    setPreviewNft(token)
    trackEvent(NFT_EVENTS.PREVIEW)
  }, [])

  const onSendSubmit = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault()

      if (selectedNfts.length) {
        // Show the NFT transfer modal
        setShowSendModal(true)

        // Track how many NFTs are being sent
        trackEvent({ ...NFT_EVENTS.SEND, label: selectedNfts.length })
      }
    },
    [selectedNfts.length],
  )

  // Add new NFTs to the accumulated list
  useEffect(() => {
    if (nftPage) {
      setAllNfts((prev) => prev.concat(nftPage.results))
    }
  }, [nftPage])

  // No NFTs to display
  if (nftPage && !nftPage.results.length) {
    return <PagePlaceholder img={<NftIcon />} text="No NFTs available or none detected" />
  }

  return (
    <>
      {error ? (
        /* Loading error */
        <ErrorMessage error={error}>Failed to load NFTs</ErrorMessage>
      ) : (
        /* NFTs */
        <form onSubmit={onSendSubmit}>
          {/* Batch send form */}
          <NftSendForm selectedNfts={selectedNfts} />

          {/* NFTs table */}
          <NftGrid
            nfts={allNfts}
            selectedNfts={selectedNfts}
            setSelectedNfts={setSelectedNfts}
            onPreview={onPreview}
            isLoading={loading || !nftPage || !!nftPage?.next}
          >
            {/* Infinite scroll at the bottom of the table */}
            {nftPage?.next ? <InfiniteScroll onLoadMore={() => setPageUrl(nftPage.next)} /> : null}
          </NftGrid>
        </form>
      )}

      {/* Send NFT modal */}
      {showSendModal && (
        <NftBatchModal
          onClose={() => setShowSendModal(false)}
          initialData={[
            {
              recipient: '',
              tokens: selectedNfts,
            },
          ]}
        />
      )}

      {/* NFT preview */}
      {<NftPreviewModal onClose={() => setPreviewNft(undefined)} nft={previewNft} />}
    </>
  )
}

export default NftCollections
