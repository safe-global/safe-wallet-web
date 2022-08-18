import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Alert, AlertTitle, Box, Paper, Typography } from '@mui/material'
import { type SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import useCollectibles from '@/hooks/useCollectibles'
import Nfts from '@/components/nfts'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import AssetsIcon from '@/public/images/sidebar/assets.svg'
import NavTabs from '@/components/common/NavTabs'
import { balancesNavItems } from '@/components/sidebar/SidebarNavigation/config'
import ErrorMessage from '@/components/tx/ErrorMessage'
import LoadMoreButton from '@/components/common/LoadMoreButton'

const NFTs: NextPage = () => {
  const [pageUrl, setPageUrl] = useState<string | undefined>()
  const [allResults, setAllResults] = useState<SafeCollectibleResponse[]>([])
  const [collectibles, error, loading] = useCollectibles(pageUrl)

  useEffect(() => {
    if (collectibles?.results.length) {
      setAllResults((prev) => prev.concat(collectibles.results))
    }
  }, [collectibles?.results, setAllResults])

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

        {allResults.length > 0 ? (
          <Nfts collectibles={allResults} />
        ) : error ? (
          <ErrorMessage error={error}>Failed to load NFTs</ErrorMessage>
        ) : (
          !loading && (
            <Paper sx={{ py: 9, textAlign: 'center' }}>
              <Typography variant="h3">No NFTs available</Typography>
            </Paper>
          )
        )}

        {(collectibles?.next || loading) && (
          <Box py={4}>
            <LoadMoreButton onLoadMore={() => setPageUrl(collectibles?.next)} loading={loading} />
          </Box>
        )}
      </Box>
    </main>
  )
}

export default NFTs
