import type { NextPage } from 'next'
import Head from 'next/head'
import { Box, CircularProgress, Typography } from '@mui/material'

import AssetsTable from '@/components/balances/AssetsTable'
import CurrencySelect from '@/components/balances/CurrencySelect'
import useBalances from '@/hooks/useBalances'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import AssetsIcon from '@/public/images/sidebar/assets.svg'
import NavTabs from '@/components/common/NavTabs'
import { balancesNavItems } from '@/components/sidebar/SidebarNavigation/config'
import { useEffect } from 'react'
import { trackEvent, ASSETS_EVENTS } from '@/services/analytics'

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
          <Box sx={{ py: 9, textAlign: 'center' }}>
            <img src="/images/no-assets.svg" alt="An icon of missing assets" />
            <Typography variant="body1" color="primary.light">
              There was an error loading your assets
            </Typography>
          </Box>
        )}
      </Box>
    </main>
  )
}

export default Balances
