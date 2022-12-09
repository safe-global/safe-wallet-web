import { Typography, Link as MuiLink, SvgIcon } from '@mui/material'
import Link from 'next/link'
import type { FallbackRender } from '@sentry/react'

import { IS_PRODUCTION } from '@/config/constants'
import { AppRoutes } from '@/config/routes'
import WarningIcon from '@/public/images/notifications/warning.svg'

import css from '@/components/common/ErrorBoundary/styles.module.css'
import CircularIcon from '../icons/CircularIcon'
import ExternalLink from '../ExternalLink'

const ErrorBoundary: FallbackRender = ({ error, componentStack }) => {
  return (
    <div className={css.container}>
      <div className={css.wrapper}>
        <Typography variant="h3" color="text.primary">
          Something went wrong,
          <br />
          please try again.
        </Typography>

        <CircularIcon icon={<SvgIcon component={WarningIcon} inheritViewBox />} badgeColor="warning" />

        {IS_PRODUCTION ? (
          <Typography color="text.primary">
            In case the problem persists, please reach out to us via our{' '}
            <Link href="https://help.safe.global" passHref target="_blank" rel="noopener noreferrer">
              <ExternalLink>Help Center</ExternalLink>
            </Link>
          </Typography>
        ) : (
          <>
            <Typography color="error">{error.toString()}</Typography>
            <Typography color="error">{componentStack}</Typography>
          </>
        )}

        <Typography mt={2}>
          <Link href={AppRoutes.welcome} passHref target="_blank" rel="noopener noreferrer" color="primary">
            <MuiLink>Go Home</MuiLink>
          </Link>
        </Typography>
      </div>
    </div>
  )
}

export default ErrorBoundary
