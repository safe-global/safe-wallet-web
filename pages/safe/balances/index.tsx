import type { NextPage } from 'next'
import { Box, Grid } from '@mui/material'

import AssetsTable from '@/components/balances/AssetsTable'
import CurrencySelect from '@/components/balances/CurrencySelect'
import useBalances from '@/hooks/useBalances'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import AssetsIcon from '@/public/images/sidebar/assets.svg'
import NavTabs from '@/components/common/NavTabs'
import { balancesNavItems } from '@/components/sidebar/SidebarNavigation/config'

const Balances: NextPage = () => {
  const { balances } = useBalances()

  return (
    <main>
      <Breadcrumbs Icon={AssetsIcon} first="Assets" second="Coins" />

      <Grid container spacing={2}>
        <Grid item xs>
          <NavTabs tabs={balancesNavItems} />
        </Grid>

        <Grid item>
          <CurrencySelect />
        </Grid>
      </Grid>

      <Box mt={2}>
        <AssetsTable items={balances?.items} />
      </Box>
    </main>
  )
}

export default Balances
