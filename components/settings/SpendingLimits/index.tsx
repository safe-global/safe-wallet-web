import { Paper, Grid, Typography, Box, Button } from '@mui/material'
import { NoSpendingLimits } from '@/components/settings/SpendingLimits/NoSpendingLimits'
import { SpendingLimitsTable } from '@/components/settings/SpendingLimits/SpendingLimitsTable'
import { useSelector } from 'react-redux'
import { selectSpendingLimits } from '@/store/spendingLimitsSlice'

const SpendingLimits = () => {
  const spendingLimits = useSelector(selectSpendingLimits)

  return (
    <Paper sx={{ padding: 4 }} variant="outlined">
      <Grid container direction="row" justifyContent="space-between" gap={2} mb={2}>
        <Grid item>
          <Typography variant="h4" fontWeight={700}>
            Spending limit
          </Typography>
        </Grid>
        <Grid item sm={12} md={8}>
          <Box>
            <Typography>
              You can set rules for specific beneficiaries to access funds from this Safe without having to collect all
              signatures.
            </Typography>
            <Button sx={{ marginTop: 2 }} variant="contained">
              New spending limit
            </Button>
          </Box>
        </Grid>
      </Grid>

      {spendingLimits.length > 0 ? <SpendingLimitsTable spendingLimits={spendingLimits} /> : <NoSpendingLimits />}
    </Paper>
  )
}

export default SpendingLimits
