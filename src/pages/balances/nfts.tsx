import { type ReactElement, memo } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Alert, AlertTitle, Box, Grid, Typography } from '@mui/material'
import AssetsHeader from '@/components/balances/AssetsHeader'
import NftCollections from '@/components/nfts/NftCollections'
import SafeAppCard from '@/components/safe-apps/SafeAppCard/SafeAppCard'
import { SafeAppsTag } from '@/config/constants'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'

// `React.memo` requires a `displayName`
const NftApps = memo(function NftApps(): ReactElement | null {
  const [nftApps] = useRemoteSafeApps(SafeAppsTag.NFT)

  if (!nftApps?.length) {
    return null
  }

  return (
    <Box mb={4}>
      <Typography component="h2" variant="subtitle1" fontWeight={700} my={2}>
        NFT Safe Apps
      </Typography>

      <Grid container spacing={3}>
        {nftApps.map((nftSafeApp) => (
          <Grid item xs={12} md={4} lg={3} key={nftSafeApp.id}>
            <SafeAppCard safeApp={nftSafeApp} />
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
