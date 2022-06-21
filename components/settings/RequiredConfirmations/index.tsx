import { ChangeThresholdDialog } from '@/components/settings/owner/ChangeThresholdDialog'
import { Typography } from '@mui/material'
import css from './styles.module.css'

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
    <div className={css.container}>
      <Typography variant="h4" fontWeight={700}>
        Required Confirmations
      </Typography>
      <Typography>Any transaction requires the confirmation of:</Typography>
      <Typography className={css.lightParagraph}>
        <b>{threshold}</b> out of <b>{owners}</b> owners.
      </Typography>
      {isGranted && <ChangeThresholdDialog />}
    </div>
  )
}
