import type { NextPage } from 'next'
import { Grid, Paper, Typography } from '@mui/material'
import { ContractVersion } from '@/components/settings/ContractVersion'
import { OwnerList } from '@/components/settings/owner/OwnerList'
import { RequiredConfirmation } from '@/components/settings/RequiredConfirmations'
import useSafeInfo from '@/hooks/useSafeInfo'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import SettingsIcon from '@/public/images/sidebar/settings.svg'

const Setup: NextPage = () => {
  const { safe } = useSafeInfo()
  const nonce = safe?.nonce
  const ownerLength = safe?.owners.length ?? 0
  const threshold = safe?.threshold ?? 0

  const isSafeOwner = useIsSafeOwner()
  const isWrongChain = useIsWrongChain()

  const isGranted = isSafeOwner && !isWrongChain

  return (
    <main>
      <Breadcrumbs icon={SettingsIcon} first="Settings" second="/ Setup" />
      <Grid container spacing={7}>
        <Grid item xs={8}>
          <Paper elevation={0} sx={{ padding: 4 }} variant="outlined">
            <Grid container>
              <Grid item xs={12}>
                <OwnerList isGranted={isGranted} />
              </Grid>
              <Grid item xs={12} marginTop={7}>
                <RequiredConfirmation threshold={threshold} owners={ownerLength} isGranted={isGranted} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item>
          <Grid item xs>
            <Typography variant="h4" fontWeight={700} paddingTop="48px">
              Safe nonce
            </Typography>
            <Typography paddingTop={1}>Current nonce: {nonce}</Typography>
          </Grid>
          <Grid item xs marginTop="64px">
            <ContractVersion />
          </Grid>
        </Grid>
      </Grid>
    </main>
  )
}

export default Setup
