import { type ReactElement, type ReactNode, type SyntheticEvent, useState } from 'react'
import { Link, Typography, SvgIcon } from '@mui/material'
import WarningIcon from '@/public/images/notifications/warning.svg'
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
        <SvgIcon component={WarningIcon} inheritViewBox fontSize="small" />

        <div>
          <Typography variant="body2" component="span">
            {children}

            {error && (
              <Link component="button" onClick={onDetailsToggle} display="block">
                Details
              </Link>
            )}
          </Typography>

          {error && showDetails && (
            <Typography variant="body2" className={css.details}>
              {error.reason || error.message.slice(0, 300)}
            </Typography>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorMessage
