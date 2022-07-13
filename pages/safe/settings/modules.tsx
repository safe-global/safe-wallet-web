import SafeModules from '@/components/settings/SafeModules'
import SpendingLimits from '@/components/settings/SpendingLimits'
import TransactionGuards from '@/components/settings/TransactionGuards'
import { Grid } from '@mui/material'
import type { NextPage } from 'next'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import SettingsIcon from '@/public/images/sidebar/settings.svg'

const Modules: NextPage = () => {
  return (
    <main>
      <Breadcrumbs icon={SettingsIcon} first="Settings" second="/ Modules" />
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <SafeModules />
        </Grid>
        <Grid item>
          <SpendingLimits />
        </Grid>
        <Grid item>
          <TransactionGuards />
        </Grid>
      </Grid>
    </main>
  )
}

export default Modules
