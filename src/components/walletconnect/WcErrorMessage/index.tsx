import { Button, Typography } from '@mui/material'
import WcLogoHeader from '../WcLogoHeader'
import css from './styles.module.css'

const WcErrorMessage = ({ error, onClose }: { error: Error; onClose: () => void }) => {
  return (
    <div className={css.errorContainer}>
      <WcLogoHeader error />

      <Typography title={error.message} className={css.errorMessage} mb={3}>
        {error.message}
      </Typography>

      <Button variant="contained" onClick={onClose} className={css.button}>
        OK
      </Button>
    </div>
  )
}

export default WcErrorMessage
