import InfoIcon from '@/public/images/notifications/info.svg'
import WarningIcon from '@/public/images/notifications/warning.svg'
import { Link, SvgIcon, Typography } from '@mui/material'
import classNames from 'classnames'
import { useState, type ReactElement, type ReactNode, type SyntheticEvent } from 'react'
import css from './styles.module.css'

const ErrorMessage = ({
  children,
  error,
  className,
  level = 'error',
}: {
  children: ReactNode
  error?: Error & { reason?: string }
  className?: string
  level?: 'error' | 'warning' | 'info'
}): ReactElement => {
  const [showDetails, setShowDetails] = useState<boolean>(false)

  const onDetailsToggle = (e: SyntheticEvent) => {
    e.preventDefault()
    setShowDetails((prev) => !prev)
  }

  return (
    <div
      data-sid="28846"
      data-testid="error-message"
      className={classNames(css.container, css[level], className, 'errorMessage')}
    >
      <div data-sid="24820" className={css.message}>
        <SvgIcon
          component={level === 'info' ? InfoIcon : WarningIcon}
          inheritViewBox
          fontSize="small"
          sx={{ color: ({ palette }) => `${palette[level].main} !important` }}
        />

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
