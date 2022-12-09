import { useState, useEffect } from 'react'
import { type SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { Box, CircularProgress } from '@mui/material'
import useCollectibles from '@/hooks/useCollectibles'
import ErrorMessage from '@/components/tx/ErrorMessage'
import InfiniteScroll from '@/components/common/InfiniteScroll'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import NftIcon from '@/public/images/common/nft.svg'
import NftTransferModal from '@/components/tx/modals/NftTransferModal'
import NftGrid from '../NftGrid'
import useIsGranted from '@/hooks/useIsGranted'

const NftCollections = () => {
  const [allNfts, setAllNfts] = useState<SafeCollectibleResponse[]>([])
  const [currentPageUrl, setCurrentPageUrl] = useState<string | undefined>()
  const [sendNft, setSendNft] = useState<SafeCollectibleResponse>()
  const isGranted = useIsGranted()

  const [page, error, loading] = useCollectibles(currentPageUrl)

  /* Aggregate NFTs from all pages */
  useEffect(() => {
    if (page) {
      setAllNfts((prev) => prev.concat(page.results))
    }
  }, [page])

  /* No NFTs to display */
  if (!allNfts.length && !loading && !error) {
    return <PagePlaceholder img={<NftIcon />} text="No NFTs available or none detected" />
  }

  return (
    <>
      {/* Aggregated NFTs grouped by collection */}
      {allNfts.length > 0 && (
        <NftGrid collectibles={allNfts} onSendClick={isGranted ? (nft) => setSendNft(nft) : undefined} />
      )}

      {/* Loading error */}
      {error && <ErrorMessage error={error}>Failed to load NFTs</ErrorMessage>}

      <Box py={4} textAlign="center">
        {/* Loading */}
        {loading && <CircularProgress size={40} />}

        {/* Infinite scroll */}
        {page?.next && <InfiniteScroll onLoadMore={() => setCurrentPageUrl(page?.next)} />}
      </Box>

      {/* Send NFT modal */}
      {isGranted && sendNft && (
        <NftTransferModal
          onClose={() => setSendNft(undefined)}
          initialData={[
            {
              recipient: '',
              token: sendNft,
            },
          ]}
        />
      )}
    </>
  )
}

export default NftCollections
