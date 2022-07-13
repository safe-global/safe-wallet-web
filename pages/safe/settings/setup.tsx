import type { NextPage } from 'next'
import { Grid, Paper, Typography } from '@mui/material'
import { ContractVersion } from '@/components/settings/ContractVersion'
import { OwnerList } from '@/components/settings/owner/OwnerList'
import { RequiredConfirmation } from '@/components/settings/RequiredConfirmations'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useIsWrongChain } from '@/hooks/wallets/useWallet'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'

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
      <Typography variant="h2">Settings / Setup</Typography>
      <Grid container spacing={7}>
        <Grid item xs={8}>
          <Paper>
            <Grid container padding="40px 48px 32px 32px">
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
