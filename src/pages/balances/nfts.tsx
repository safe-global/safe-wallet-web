import type { NextPage } from 'next'
import Head from 'next/head'
import { Alert, AlertTitle, Box } from '@mui/material'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import AssetsIcon from '@/public/images/sidebar/assets.svg'
import NavTabs from '@/components/common/NavTabs'
import { balancesNavItems } from '@/components/sidebar/SidebarNavigation/config'
import NftCollections from '@/components/nfts/NftCollections'

const NFTs: NextPage = () => {
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

        <NftCollections />
      </Box>
    </main>
  )
}

export default NFTs
