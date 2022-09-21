import { Grid, Typography } from '@mui/material'

export const NoSpendingLimits = () => {
  return (
    <Grid mt={2} container direction="row" justifyContent="space-between" spacing={2}>
      <Grid item sm={2}>
        <img
          alt="Select Beneficiary"
          title="Beneficiary"
          height={75}
          src="/images/settings/spending-limit/beneficiary.svg"
        />
      </Grid>
      <Grid item sm={10}>
        <Typography marginTop={2}>
          <b>Select beneficiary</b>
        </Typography>
        <Typography>
          Choose an account that will benefit from this allowance. The beneficiary does not have to be an owner of this
          Safe
        </Typography>
      </Grid>

      <Grid item sm={2}>
        <img
          alt="Select asset and amount"
          title="Asset and amount"
          height={75}
          src="/images/settings/spending-limit/asset-amount.svg"
        />
      </Grid>
      <Grid item sm={10}>
        <Typography marginTop={2}>
          <b>Select asset and amount</b>
        </Typography>
        <Typography>You can set allowances for any asset stored in your Safe</Typography>
      </Grid>

      <Grid item sm={2}>
        <img alt="Select time" title="Time" height={75} src="/images/settings/spending-limit/time.svg" />
      </Grid>
      <Grid item sm={10}>
        <Typography marginTop={2}>
          <b>Select time</b>
        </Typography>
        <Typography>
          You can choose to set a one-time allowance or to have it automatically refill after a defined time-period
        </Typography>
      </Grid>
    </Grid>
  )
}
