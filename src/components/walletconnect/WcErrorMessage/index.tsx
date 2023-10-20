import { Typography } from '@mui/material'
import WcLogoHeader from '../WcLogoHeader'
import css from './styles.module.css'

const WcErrorMessage = ({ error }: { error: Error }) => {
  return (
    <div className={css.errorContainer}>
      <WcLogoHeader error />

      <Typography title={error.message} className={css.errorMessage}>
        {error.message}
      </Typography>
    </div>
  )
}

export default WcErrorMessage
