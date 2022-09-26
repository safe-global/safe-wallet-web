import { type ReactElement, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Alert, AlertTitle, Box, CircularProgress } from '@mui/material'
import useCollectibles from '@/hooks/useCollectibles'
import Nfts from '@/components/nfts'
import AssetsHeader from '@/components/balances/AssetsHeader'
import ErrorMessage from '@/components/tx/ErrorMessage'
import InfiniteScroll from '@/components/common/InfiniteScroll'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import NftIcon from '@/public/images/nft.svg'

const NftPage = ({
  pageUrl,
  onNextPage,
}: {
  pageUrl: string
  onNextPage?: (pageUrl?: string) => void
}): ReactElement => {
  const [collectibles, error] = useCollectibles(pageUrl)

  if (collectibles) {
    return (
      <>
        {collectibles.results.length > 0 ? (
          <Nfts collectibles={collectibles.results} />
        ) : (
          <PagePlaceholder img={<NftIcon />} text="No NFTs available or none detected" />
        )}

        {onNextPage && collectibles.next && (
          <Box py={4} textAlign="center">
            <InfiniteScroll onLoadMore={() => onNextPage(collectibles.next)} />
          </Box>
        )}
      </>
    )
  }

  if (error) {
    return <ErrorMessage error={error}>Failed to load NFTs</ErrorMessage>
  }

  return (
    <Box py={4} textAlign="center">
      <CircularProgress size={40} />
    </Box>
  )
}

const NFTs: NextPage = () => {
  const [pages, setPages] = useState<string[]>([''])

  const onNextPage = (pageUrl = '') => {
    setPages([...pages, pageUrl])
  }

  return (
    <>
      <Head>
        <title>Safe – NFTs</title>
      </Head>

      <AssetsHeader />

      <main>
        <Alert severity="info" sx={{ marginBottom: 6 }}>
          <AlertTitle>Use Safe Apps to view your NFT portfolio</AlertTitle>
          Get the most optimal experience with Safe Apps. View your collections, buy or sell NFTs, and more.
        </Alert>

        {pages.map((pageUrl, index) => (
          <NftPage key={index} pageUrl={pageUrl} onNextPage={index === pages.length - 1 ? onNextPage : undefined} />
        ))}
      </main>
    </>
  )
}

export default NFTs
