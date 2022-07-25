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
      <Grid container justifyContent="space-between" gap={2}>
        <Grid item>
          <Typography variant="h4" fontWeight={700}>
            Required confirmations
          </Typography>
        </Grid>
        <Grid item md={8}>
          <Typography>Any transaction requires the confirmation of:</Typography>
          <Typography paddingTop={3}>
            <b>{threshold}</b> out of <b>{owners}</b> owners.
          </Typography>
          {isGranted && <ChangeThresholdDialog />}
        </Grid>
      </Grid>
    </Box>
  )
}
