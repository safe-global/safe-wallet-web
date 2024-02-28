import { type ReactElement, type ReactNode, type SyntheticEvent, useState } from 'react'
import { Link, Typography, SvgIcon } from '@mui/material'
import classNames from 'classnames'
import WarningIcon from '@/public/images/notifications/warning.svg'
import InfoIcon from '@/public/images/notifications/info.svg'
import css from './styles.module.css'

// TODO: Rename this to AlertMessage and make it a more generalized wrapper to be used instead of MUI Alert
const ErrorMessage = ({
  children,
  error,
  className,
  level = 'error',
}: {
  children: ReactNode
  error?: Error & { reason?: string }
  className?: string
  level?: 'error' | 'warning' | 'info' | 'border'
}): ReactElement => {
  const [showDetails, setShowDetails] = useState<boolean>(false)

  const onDetailsToggle = (e: SyntheticEvent) => {
    e.preventDefault()
    setShowDetails((prev) => !prev)
  }

  return (
    <div data-testid="error-message" className={classNames(css.container, css[level], className, 'errorMessage')}>
      <div className={css.message}>
        <SvgIcon
          component={level === 'info' || level === 'border' ? InfoIcon : WarningIcon}
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
