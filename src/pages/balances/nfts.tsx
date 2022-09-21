import { type ReactElement, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Alert, AlertTitle, Box, CircularProgress, Typography } from '@mui/material'
import useCollectibles from '@/hooks/useCollectibles'
import Nfts from '@/components/nfts'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import AssetsIcon from '@/public/images/sidebar/assets.svg'
import NavTabs from '@/components/common/NavTabs'
import { balancesNavItems } from '@/components/sidebar/SidebarNavigation/config'
import ErrorMessage from '@/components/tx/ErrorMessage'
import InfiniteScroll from '@/components/common/InfiniteScroll'

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
          <Box sx={{ py: 9, textAlign: 'center' }}>
            <img src="/images/nft.svg" alt="An icon of a diamond" />
            <Typography variant="body1" color="primary.light">
              No NFTs available, or not
              <br />
              all are detected
            </Typography>
          </Box>
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
    <main>
      <Head>
        <title>Safe – NFTs</title>
      </Head>

      <Breadcrumbs Icon={AssetsIcon} first="Assets" second="NFTs" />

      <NavTabs tabs={balancesNavItems} />

      <Box py={3}>
        <Alert severity="info" sx={{ marginBottom: 6 }}>
          <AlertTitle>Use Safe Apps to view your NFT portfolio</AlertTitle>
          Get the most optimal experience with Safe Apps. View your collections, buy or sell NFTs, and more.
        </Alert>

        {pages.map((pageUrl, index) => (
          <NftPage key={index} pageUrl={pageUrl} onNextPage={index === pages.length - 1 ? onNextPage : undefined} />
        ))}
      </Box>
    </main>
  )
}

export default NFTs
