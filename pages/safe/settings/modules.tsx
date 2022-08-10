import type { NextPage } from 'next'
import Head from 'next/head'
import { Grid } from '@mui/material'
import SafeModules from '@/components/settings/SafeModules'
import TransactionGuards from '@/components/settings/TransactionGuards'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import SettingsIcon from '@/public/images/sidebar/settings.svg'

const Modules: NextPage = () => {
  return (
    <main>
      <Head>
        <title>Safe – Settings – Modules</title>
      </Head>

      <Breadcrumbs Icon={SettingsIcon} first="Settings" second="Modules" />

      <Grid container direction="column" spacing={2}>
        <Grid item>
          <SafeModules />
        </Grid>

        <Grid item>
          <TransactionGuards />
        </Grid>
      </Grid>
    </main>
  )
}

export default Modules
