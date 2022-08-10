import type { NextPage } from 'next'
import { Grid, Paper, Typography } from '@mui/material'
import { ContractVersion } from '@/components/settings/ContractVersion'
import { OwnerList } from '@/components/settings/owner/OwnerList'
import { RequiredConfirmation } from '@/components/settings/RequiredConfirmations'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import SettingsIcon from '@/public/images/sidebar/settings.svg'
import useIsGranted from '@/hooks/useIsGranted'

const Setup: NextPage = () => {
  const { safe } = useSafeInfo()
  const nonce = safe.nonce
  const ownerLength = safe.owners.length
  const threshold = safe.threshold
  const isGranted = useIsGranted()

  return (
    <main>
      <Breadcrumbs Icon={SettingsIcon} first="Settings" second="Setup" />

      <Paper sx={{ padding: 4, marginBottom: 2 }} variant="outlined">
        <Grid container spacing={3}>
          <Grid item lg={4} xs={12}>
            <Typography variant="h4" fontWeight={700}>
              Safe nonce
            </Typography>
            <Typography paddingTop={1}>Current nonce: {nonce}</Typography>
          </Grid>

          <Grid item xs>
            <ContractVersion isGranted={isGranted} />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ padding: 4 }} variant="outlined">
        <OwnerList isGranted={isGranted} />
        <RequiredConfirmation threshold={threshold} owners={ownerLength} isGranted={isGranted} />
      </Paper>
    </main>
  )
}

export default Setup
