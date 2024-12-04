import { splitError } from '@/features/walletconnect/services/utils'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import WcLogoHeader from '../WcLogoHeader'
import css from './styles.module.css'

const WcErrorMessage = ({ error, onClose }: { error: Error; onClose: () => void }) => {
  const message = error.message || 'An error occurred'
  const [summary, details] = splitError(message)

  return (
    <div className={css.errorContainer}>
      <WcLogoHeader errorMessage={summary} />
      {details && (
        <Typography
          className={css.details}
          sx={{
            mt: 1,
          }}
        >
          {details}
        </Typography>
      )}
      <Button variant="contained" onClick={onClose} className={css.button}>
        OK
      </Button>
    </div>
  )
}

export default WcErrorMessage
