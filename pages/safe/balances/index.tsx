import type { NextPage } from 'next'
import { Box, CircularProgress } from '@mui/material'

import AssetsTable from '@/components/balances/AssetsTable'
import CurrencySelect from '@/components/balances/CurrencySelect'
import useBalances from '@/hooks/useBalances'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import AssetsIcon from '@/public/images/sidebar/assets.svg'
import NavTabs from '@/components/common/NavTabs'
import { balancesNavItems } from '@/components/sidebar/SidebarNavigation/config'
import { PaddedMain } from '@/components/common/PaddedMain'

const Balances: NextPage = () => {
  const { balances, loading } = useBalances()

  return (
    <PaddedMain>
      <Breadcrumbs Icon={AssetsIcon} first="Assets" second="Coins" />

      <NavTabs tabs={balancesNavItems} />

      <CurrencySelect />

      <Box mt={2}>
        <AssetsTable items={balances?.items} />

        {loading && <CircularProgress size={20} sx={{ marginTop: 2 }} />}
      </Box>
    </PaddedMain>
  )
}

export default Balances
