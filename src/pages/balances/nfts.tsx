import type { NextPage } from 'next'
import Head from 'next/head'
import { Alert, AlertTitle, Box, Grid, Typography } from '@mui/material'
import { type ReactElement, useMemo, memo } from 'react'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import AssetsIcon from '@/public/images/sidebar/assets.svg'
import NavTabs from '@/components/common/NavTabs'
import { balancesNavItems } from '@/components/sidebar/SidebarNavigation/config'
import NftCollections from '@/components/nfts/NftCollections'
import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import { AppCard } from '@/components/safe-apps/AppCard'

// `React.memo` requires a `displayName`
const NftApps = memo(function NftApps(): ReactElement | null {
  const NFT_APPS_TAG = 'nft'

  const { allSafeApps } = useSafeApps()

  const nftApps = useMemo(() => allSafeApps.filter((app) => app.tags.includes(NFT_APPS_TAG)), [allSafeApps])

  if (nftApps.length === 0) {
    return null
  }

  return (
    <>
      <Typography component="h2" variant="subtitle1" fontWeight={700} my={2}>
        NFT apps
      </Typography>
      <Grid container spacing={3}>
        {nftApps.map((nftApp) => (
          <Grid item xs={12} md={4} lg={3} key={nftApp.id}>
            <AppCard safeApp={nftApp} />
          </Grid>
        ))}
      </Grid>
    </>
  )
})

const NFTs: NextPage = () => {
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

        <NftApps />

        <NftCollections />
      </Box>
    </main>
  )
}

export default NFTs
