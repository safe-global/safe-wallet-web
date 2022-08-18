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
import { ASSETS_EVENTS } from '@/services/analytics/events/assets'
import { trackEvent } from '@/services/analytics/analytics'

const Balances: NextPage = () => {
  const { balances, loading } = useBalances()

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
        <AssetsTable items={balances?.items} />

        {loading && <CircularProgress size={20} sx={{ marginTop: 2 }} />}
      </Box>
    </main>
  )
}

export default Balances
