import { ChangeThresholdDialog } from '@/components/settings/owner/ChangeThresholdDialog'
import { Typography } from '@mui/material'

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
    <div>
      <Typography variant="h4" fontWeight={700}>
        Required Confirmations
      </Typography>
      <Typography paddingTop={1}>Any transaction requires the confirmation of:</Typography>
      <Typography paddingTop={3}>
        <b>{threshold}</b> out of <b>{owners}</b> owners.
      </Typography>
      {isGranted && <ChangeThresholdDialog />}
    </div>
  )
}
