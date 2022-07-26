import { Paper, Grid, Typography, Box, Button } from '@mui/material'

const SpendingLimits = () => {
  return (
    <Paper sx={{ padding: 4 }} variant="outlined">
      <Grid container direction="row" justifyContent="space-between" gap={2}>
        <Grid item>
          <Typography variant="h4" fontWeight={700}>
            Spending limits
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
            <Grid mt={2} container direction="row" justifyContent="space-between" spacing={2}>
              <Grid item sm={12} md={3}>
                <Box>
                  <img
                    alt="Select Beneficiary"
                    title="Beneficiary"
                    height={75}
                    src="/images/settings/spending-limit/beneficiary.svg"
                  />
                  <Typography marginTop={2}>
                    <b>Select beneficiary</b>
                  </Typography>
                  <Typography>
                    Choose an account that will benefit from this allowance. The beneficiary does not have to be an
                    owner of this Safe
                  </Typography>
                </Box>
              </Grid>
              <Grid item sm={12} md={3}>
                <Box>
                  <img
                    alt="Select asset and amount"
                    title="Asset and amount"
                    height={75}
                    src="/images/settings/spending-limit/asset-amount.svg"
                  />
                  <Typography marginTop={2}>
                    <b>Select asset and amount</b>
                  </Typography>
                  <Typography>You can set allowances for any asset stored in your Safe</Typography>
                </Box>
              </Grid>
              <Grid item sm={12} md={3}>
                <Box>
                  <img alt="Select time" title="Time" height={75} src="/images/settings/spending-limit/time.svg" />
                  <Typography marginTop={2}>
                    <b>Select time</b>
                  </Typography>
                  <Typography>
                    You can choose to set a one-time allowance or to have it automatically refill after a defined
                    time-period
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default SpendingLimits
