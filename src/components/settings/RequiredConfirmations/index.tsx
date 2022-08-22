import { ChangeThresholdDialog } from '@/components/settings/owner/ChangeThresholdDialog'
import { Box, Grid, Typography } from '@mui/material'

export const RequiredConfirmation = ({
  threshold,
  owners,
  isGranted,
}: {
  threshold: number
  owners: number
  isGranted: boolean
}) => {
  return (
    <Box marginTop={6}>
      <Grid container spacing={3}>
        <Grid item lg={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Required confirmations
          </Typography>
        </Grid>

        <Grid item xs>
          <Typography>Any transaction requires the confirmation of:</Typography>
          <Typography paddingTop={3}>
            <b>{threshold}</b> out of <b>{owners}</b> owners.
          </Typography>
          {isGranted && owners > 1 && <ChangeThresholdDialog />}
        </Grid>
      </Grid>
    </Box>
  )
}
