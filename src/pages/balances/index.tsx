import type { NextPage } from 'next'
import Head from 'next/head'
import { Box, CircularProgress } from '@mui/material'

import AssetsTable from '@/components/balances/AssetsTable'
import CurrencySelect from '@/components/balances/CurrencySelect'
import useBalances from '@/hooks/useBalances'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import AssetsIcon from '@/public/images/sidebar/assets.svg'
import NavTabs from '@/components/common/NavTabs'
import { balancesNavItems } from '@/components/sidebar/SidebarNavigation/config'
import { useEffect } from 'react'
import { trackEvent, ASSETS_EVENTS } from '@/services/analytics'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import NoAssetsIcon from '@/public/images/no-assets.svg'

const Balances: NextPage = () => {
  const { balances, loading, error } = useBalances()

  useEffect(() => {
    if (!loading && balances.items.length === 0) {
      trackEvent({ ...ASSETS_EVENTS.DIFFERING_TOKENS, label: balances.items.length })
    }
  }, [balances, loading])

  return (
    <main>
      <Head>
        <title>Safe – Assets</title>
      </Head>

      <Breadcrumbs Icon={AssetsIcon} first="Assets" second="Coins" />

      <NavTabs tabs={balancesNavItems} />

      <CurrencySelect />

      <Box mt={2}>
        {loading && <CircularProgress size={20} sx={{ marginTop: 2 }} />}
        {!error ? (
          <AssetsTable items={balances?.items} />
        ) : (
          <PagePlaceholder
            img={<NoAssetsIcon />}
            text="
              There was an error loading your assets"
          />
        )}
      </Box>
    </main>
  )
}

export default Balances
