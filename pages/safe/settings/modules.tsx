import SafeModules from '@/components/settings/SafeModules'
import TransactionGuards from '@/components/settings/TransactionGuards'
import { Grid } from '@mui/material'
import type { NextPage } from 'next'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PaddedMain } from '@/components/common/PaddedMain'
import SettingsIcon from '@/public/images/sidebar/settings.svg'

const Modules: NextPage = () => {
  return (
    <PaddedMain>
      <Breadcrumbs Icon={SettingsIcon} first="Settings" second="Modules" />
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <SafeModules />
        </Grid>
        <Grid item>
          <TransactionGuards />
        </Grid>
      </Grid>
    </PaddedMain>
  )
}

export default Modules
