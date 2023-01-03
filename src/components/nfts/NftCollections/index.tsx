import { useEffect, useMemo, useState } from 'react'
import { type SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { Box, Button, CircularProgress, SvgIcon, Typography } from '@mui/material'
import ErrorMessage from '@/components/tx/ErrorMessage'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import NftIcon from '@/public/images/common/nft.svg'
import ArrowIcon from '@/public/images/common/arrow-nw.svg'
import NftBatchModal from '@/components/tx/modals/NftBatchModal'
import NftGrid from '../NftGrid'
import useIsGranted from '@/hooks/useIsGranted'
import useCollectibles from '@/hooks/useCollectibles'
import InfiniteScroll from '@/components/common/InfiniteScroll'
import Track from '@/components/common/Track'
import { NFT_EVENTS } from '@/services/analytics/events/nfts'

const NftCollections = () => {
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
  // Filter string
  const [filter, setFilter] = useState<string>('')
  // Whether we can send NFTs
  const isGranted = useIsGranted()

  // Add or remove NFT from the selected list on row click
  const onSelect = (token: SafeCollectibleResponse) => {
    setSelectedNfts((prev) => (prev.includes(token) ? prev.filter((t) => t !== token) : prev.concat(token)))
  }

  // Filter by collection name or token address
  const filteredNfts = useMemo(() => {
    return allNfts.filter(
      (nft) => nft.tokenName.toLowerCase().includes(filter) || nft.address.toLowerCase().includes(filter),
    )
  }, [allNfts, filter])

  // Add new NFTs to the accumulated list
  useEffect(() => {
    if (nftPage) {
      setAllNfts((prev) => prev.concat(nftPage.results))
    }
  }, [nftPage])

  // Initial loading
  if (loading && !allNfts.length) {
    return (
      <Box py={4} textAlign="center">
        <CircularProgress size={40} />
      </Box>
    )
  }

  // No NFTs to display
  if (nftPage && !nftPage.results.length) {
    return <PagePlaceholder img={<NftIcon />} text="No NFTs available or none detected" />
  }

  const nftsText = `NFT${selectedNfts.length === 1 ? '' : 's'}`
  const noSelected = selectedNfts.length === 0

  return (
    <>
      {allNfts?.length > 0 && (
        <>
          {/* Batch send form */}
          <Box pb="12.5px" bgcolor="background.main" display="flex" alignItems="center" gap={1}>
            <Box bgcolor="secondary.background" py={0.75} px={2} flex={1} borderRadius={1} mr={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <SvgIcon component={ArrowIcon} inheritViewBox color="border" sx={{ width: 12, height: 12 }} />

                <Typography variant="body2" lineHeight="inherit">
                  {`${selectedNfts.length} ${nftsText} selected`}
                </Typography>
              </Box>
            </Box>

            <Button
              onClick={() => setSelectedNfts(noSelected ? allNfts : [])}
              variant="outlined"
              size="small"
              sx={{
                // The custom padding is needed to align the outlined button with the adjacent filled button
                py: '6px',
                minWidth: '10em',
              }}
            >
              {noSelected ? 'Select all' : 'Deselect all'}
            </Button>

            <Track {...NFT_EVENTS.SEND} label={selectedNfts.length}>
              <Button
                onClick={() => setShowSendModal(true)}
                variant="contained"
                size="small"
                disabled={!isGranted || noSelected}
                sx={{
                  minWidth: '10em',
                }}
              >
                {!isGranted ? 'Read only' : selectedNfts.length ? `Send ${selectedNfts.length} ${nftsText}` : 'Send'}
              </Button>
            </Track>
          </Box>

          {/* NFTs table */}
          <NftGrid
            nfts={filteredNfts}
            selectedNfts={selectedNfts}
            onSelect={onSelect}
            onFilter={setFilter}
            isLoading={(loading || !!nftPage?.next) && !error}
          >
            {/* Infinite scroll at the bottom of the table */}
            {nftPage?.next ? <InfiniteScroll onLoadMore={() => setPageUrl(nftPage.next)} /> : null}
          </NftGrid>
        </>
      )}

      {/* Loading error */}
      {error && <ErrorMessage error={error}>Failed to load NFTs</ErrorMessage>}

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
    </>
  )
}

export default NftCollections
