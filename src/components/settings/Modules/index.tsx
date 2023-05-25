import type { NextPage } from 'next'
import { Grid } from '@mui/material'
import SafeModules from '@/components/settings/SafeModules'
import TransactionGuards from '@/components/settings/TransactionGuards'
import { FallbackHandler } from '@/components/settings/FallbackHandler'


const ModulesGroup: NextPage = () => {
  return (
    <main>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <SafeModules />
        </Grid>

        <Grid item>
          <TransactionGuards />
        </Grid>

        <Grid item>
          <FallbackHandler />
        </Grid>
      </Grid>
    </main>
  )
}

export default ModulesGroup