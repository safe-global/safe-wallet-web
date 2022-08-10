import { useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Alert, AlertTitle, Box, CircularProgress, Paper, Typography } from '@mui/material'
import useCollectibles from '@/hooks/useCollectibles'
import Nfts from '@/components/nfts'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import AssetsIcon from '@/public/images/sidebar/assets.svg'
import NavTabs from '@/components/common/NavTabs'
import { balancesNavItems } from '@/components/sidebar/SidebarNavigation/config'
import Pagination from '@/components/transactions/Pagination'
import ErrorMessage from '@/components/tx/ErrorMessage'

const NFTs: NextPage = () => {
  const [pageUrl, setPageUrl] = useState<string | undefined>()
  const [collectibles, error, loading] = useCollectibles(pageUrl)

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

        {loading ? (
          <CircularProgress size={40} sx={{ marginTop: 2 }} />
        ) : error ? (
          <ErrorMessage error={error}>Failed to load NFTs</ErrorMessage>
        ) : collectibles?.results.length ? (
          <Nfts collectibles={collectibles.results} />
        ) : (
          <Paper sx={{ py: 9, textAlign: 'center' }}>
            <Typography variant="h3">No NFTs available</Typography>
          </Paper>
        )}

        {!!(collectibles?.next || collectibles?.previous) && (
          <Box py={4}>
            <Pagination
              page={pageUrl}
              nextPage={collectibles?.next}
              prevPage={collectibles?.previous}
              onPageChange={setPageUrl}
            />
          </Box>
        )}
      </Box>
    </main>
  )
}

export default NFTs
