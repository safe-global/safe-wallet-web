import { Button, Typography } from '@mui/material'
import WcLogoHeader from '../WcLogoHeader'
import css from './styles.module.css'

const WcErrorMessage = ({ error, onClose }: { error: Error; onClose: () => void }) => {
  const message = error.message || 'An error occurred'
  const [summary, details] = message.split(':')

  return (
    <div className={css.errorContainer}>
      <WcLogoHeader error />

      <Typography title={error.message} className={css.errorMessage} mb={3}>
        {summary}
      </Typography>

      {details && <Typography variant="body2">{details}</Typography>}

      <Button variant="contained" onClick={onClose} className={css.button}>
        OK
      </Button>
    </div>
  )
}

export default WcErrorMessage
