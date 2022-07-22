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
  const nonce = safe.nonce
  const ownerLength = safe.owners.length
  const threshold = safe.threshold

  const isSafeOwner = useIsSafeOwner()
  const isWrongChain = useIsWrongChain()

  const isGranted = isSafeOwner && !isWrongChain

  return (
    <main>
      <Breadcrumbs Icon={SettingsIcon} first="Settings" second="Setup" />
      <Paper sx={{ padding: 4 }} variant="outlined">
        <OwnerList isGranted={isGranted} />
        <RequiredConfirmation threshold={threshold} owners={ownerLength} isGranted={isGranted} />
      </Paper>
      <Paper sx={{ padding: 4, marginTop: 2 }} variant="outlined">
        <Grid container justifyContent="space-between" gap={2}>
          <Grid item>
            <Typography variant="h4" fontWeight={700}>
              Safe nonce
            </Typography>
            <Typography paddingTop={1}>Current nonce: {nonce}</Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <ContractVersion />
          </Grid>
        </Grid>
      </Paper>
    </main>
  )
}

export default Setup
