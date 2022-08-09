import { Paper, Grid, Typography, Box } from '@mui/material'
import { NoSpendingLimits } from '@/components/settings/SpendingLimits/NoSpendingLimits'
import { SpendingLimitsTable } from '@/components/settings/SpendingLimits/SpendingLimitsTable'
import { useSelector } from 'react-redux'
import { selectSpendingLimits } from '@/store/spendingLimitsSlice'
import { NewSpendingLimit } from '@/components/settings/SpendingLimits/NewSpendingLimit'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import { useCurrentChain } from '@/hooks/useChains'
import { hasFeature } from '@/utils/chains'
import { FEATURES } from '@gnosis.pm/safe-react-gateway-sdk'

const SpendingLimits = () => {
  const isSafeOwner = useIsSafeOwner()
  const isWrongChain = useIsWrongChain()
  const spendingLimits = useSelector(selectSpendingLimits)
  const currentChain = useCurrentChain()

  const isEnabled = currentChain && hasFeature(currentChain, FEATURES.SPENDING_LIMIT)
  const isGranted = isSafeOwner && !isWrongChain

  return (
    <Paper sx={{ padding: 4 }} variant="outlined">
      <Grid container direction="row" justifyContent="space-between" spacing={3} mb={2}>
        <Grid item lg={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Spending limit
          </Typography>
        </Grid>

        <Grid item xs>
          {isEnabled ? (
            <Box>
              <Typography>
                You can set rules for specific beneficiaries to access funds from this Safe without having to collect
                all signatures.
              </Typography>

              {isGranted && <NewSpendingLimit />}
            </Box>
          ) : (
            <Typography>The spending limit module is not yet available on this chain.</Typography>
          )}
        </Grid>
      </Grid>

      {isEnabled ? (
        spendingLimits.length > 0 ? (
          <SpendingLimitsTable spendingLimits={spendingLimits} />
        ) : (
          <NoSpendingLimits />
        )
      ) : null}
    </Paper>
  )
}

export default SpendingLimits
