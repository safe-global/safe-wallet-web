import { type ReactElement, useState, useMemo } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Alert, AlertTitle, Box, CircularProgress, Grid, Typography } from '@mui/material'
import useCollectibles from '@/hooks/useCollectibles'
import Nfts from '@/components/nfts'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import AssetsIcon from '@/public/images/sidebar/assets.svg'
import NavTabs from '@/components/common/NavTabs'
import { balancesNavItems } from '@/components/sidebar/SidebarNavigation/config'
import ErrorMessage from '@/components/tx/ErrorMessage'
import InfiniteScroll from '@/components/common/InfiniteScroll'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import NftIcon from '@/public/images/nft.svg'
import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import { AppCard } from '@/components/safe-apps/AppCard'

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

const NftApps = (): ReactElement => {
  const NFT_APPS_TAG = 'nft'

  const { allSafeApps } = useSafeApps()

  const nftApps = useMemo(() => allSafeApps.filter((app) => app.tags?.includes(NFT_APPS_TAG)), [allSafeApps])

  return (
    <Grid container spacing={3}>
      {nftApps.map((nftApp) => (
        <Grid item xs={12} md={4} lg={3} key={nftApp.id}>
          <AppCard safeApp={nftApp} />
        </Grid>
      ))}
    </Grid>
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
        <Alert severity="info">
          <AlertTitle>Use Safe Apps to view your NFT portfolio</AlertTitle>
          Get the most optimal experience with Safe Apps. View your collections, buy or sell NFTs, and more.
        </Alert>

        <Typography component="h2" variant="subtitle1" fontWeight={700} my={2}>
          NFT Apps
        </Typography>

        <NftApps />

        <Typography component="h2" variant="subtitle1" fontWeight={700} my={2}>
          NFTs
        </Typography>

        {pages.map((pageUrl, index) => (
          <NftPage key={index} pageUrl={pageUrl} onNextPage={index === pages.length - 1 ? onNextPage : undefined} />
        ))}
      </Box>
    </main>
  )
}

export default NFTs
