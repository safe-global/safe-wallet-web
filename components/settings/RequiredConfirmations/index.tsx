import { Paper } from '@mui/material'
import css from './styles.module.css'

export const RequiredConfirmation = ({ threshold, owners }: { threshold: number; owners: number }) => {
  return (
    <Paper elevation={1} className={css.container}>
      <h3>Required Confirmations</h3>
      <p>Any transaction requires the confirmation of:</p>
      <p className={css.lightParagraph}>
        <b>{threshold}</b> out of <b>{owners}</b> owners.
      </p>
    </Paper>
  )
}
