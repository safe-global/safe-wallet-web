import { type ReactElement, type ReactNode, type SyntheticEvent, useState } from 'react'
import { Link, Typography } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import css from './styles.module.css'

const ErrorMessage = ({
  children,
  error,
}: {
  children: ReactNode
  error?: Error & { reason?: string }
}): ReactElement => {
  const [showDetails, setShowDetails] = useState<boolean>(false)

  const onDetailsToggle = (e: SyntheticEvent) => {
    e.preventDefault()
    setShowDetails((prev) => !prev)
  }

  return (
    <div className={css.container}>
      <div className={css.message}>
        <WarningAmberIcon className={css.icon} />

        <div>
          <Typography variant="body2">{children}</Typography>

          {error && showDetails && (
            <Typography variant="body2" className={css.details}>
              {error.reason || error.message.slice(0, 300)}
            </Typography>
          )}
        </div>

        {error && (
          <Link component="button" onClick={onDetailsToggle}>
            Details
          </Link>
        )}
      </div>
    </div>
  )
}

export default ErrorMessage
