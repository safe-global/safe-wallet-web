import { type ReactElement, useMemo, memo } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Alert, AlertTitle, Box, Grid, Typography } from '@mui/material'
import AssetsHeader from '@/components/balances/AssetsHeader'
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
    <Box mb={4}>
      <Typography component="h2" variant="subtitle1" fontWeight={700} my={2}>
        NFT Safe Apps
      </Typography>

      <Grid container spacing={3}>
        {nftApps.map((nftApp) => (
          <Grid item xs={12} md={4} lg={3} key={nftApp.id}>
            <AppCard safeApp={nftApp} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
})

const NFTs: NextPage = () => {
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

        <NftApps />

        <NftCollections />
      </main>
    </>
  )
}

export default NFTs
