import SafeModules from '@/components/settings/SafeModules'
import SpendingLimits from '@/components/settings/SpendingLimits'
import TransactionGuards from '@/components/settings/TransactionGuards'
import { Grid, Typography } from '@mui/material'
import type { NextPage } from 'next'

const Modules: NextPage = () => {
  return (
    <main>
      <Typography variant="h2">Settings / Modules</Typography>
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
