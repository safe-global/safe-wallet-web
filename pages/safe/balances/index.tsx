import type { NextPage } from 'next'
import { Grid } from '@mui/material'

import AssetsTable from '@/components/balances/AssetsTable'
import CurrencySelect from '@/components/balances/CurrencySelect'
import useBalances from '@/hooks/useBalances'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import AssetsIcon from '@/public/images/sidebar/assets.svg'

const Balances: NextPage = () => {
  const { balances } = useBalances()

  return (
    <main>
      <Grid container spacing={2}>
        <Grid item xs>
          <Breadcrumbs icon={AssetsIcon} first="Assets" second="/ Coins" />
        </Grid>

        <Grid item>
          <CurrencySelect />
        </Grid>
      </Grid>

      <AssetsTable items={balances?.items} />
    </main>
  )
}

export default Balances
