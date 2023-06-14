import { Paper, Grid, Typography, Box } from '@mui/material'
import { NoSpendingLimits } from '@/components/settings/SpendingLimits/NoSpendingLimits'
import { SpendingLimitsTable } from '@/components/settings/SpendingLimits/SpendingLimitsTable'
import { useSelector } from 'react-redux'
import { selectSpendingLimits, selectSpendingLimitsLoading } from '@/store/spendingLimitsSlice'
import { NewSpendingLimit } from '@/components/settings/SpendingLimits/NewSpendingLimit'
import { FEATURES } from '@/utils/chains'
import { useHasFeature } from '@/hooks/useChains'

const SpendingLimits = () => {
  const spendingLimits = useSelector(selectSpendingLimits)
  const spendingLimitsLoading = useSelector(selectSpendingLimitsLoading)
  const isEnabled = useHasFeature(FEATURES.SPENDING_LIMIT)

  return (
    <Paper sx={{ padding: 4 }}>
      <Grid container direction="row" justifyContent="space-between" spacing={3} mb={2}>
        <Grid item lg={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Spending limits
          </Typography>
        </Grid>

        <Grid item xs>
          {isEnabled ? (
            <Box>
              <Typography>
                You can set rules for specific beneficiaries to access funds from this Safe Account without having to
                collect all signatures.
              </Typography>

              <NewSpendingLimit />

              {!spendingLimits.length && !spendingLimitsLoading && <NoSpendingLimits />}
            </Box>
          ) : (
            <Typography>The spending limit module is not yet available on this chain.</Typography>
          )}
        </Grid>
      </Grid>
      <SpendingLimitsTable isLoading={spendingLimitsLoading} spendingLimits={spendingLimits} />
    </Paper>
  )
}

export default SpendingLimits
