import { Typography, Link as MuiLink } from '@mui/material'
import Link from 'next/link'
import type { FallbackRender } from '@sentry/react'
import type { ComponentProps } from 'react'
import type { Router } from 'next/router'

import { IS_PRODUCTION } from '@/config/constants'
import { AppRoutes } from '@/config/routes'
import WarningIcon from '@/public/images/notifications/warning.svg'

import css from '@/components/common/ErrorBoundary/styles.module.css'
import CircularIcon from '../icons/CircularIcon'
import ExternalLink from '../ExternalLink'

type Props = ComponentProps<FallbackRender> & { router: Router }

const ErrorBoundary = ({ error, componentStack, resetError, router }: Props) => {
  return (
    <div className={css.container}>
      <div className={css.wrapper}>
        <Typography variant="h3" color="text.primary">
          Something went wrong,
          <br />
          please try again.
        </Typography>

        <CircularIcon icon={WarningIcon} badgeColor="warning" />

        {IS_PRODUCTION ? (
          <Typography color="text.primary">
            In case the problem persists, please reach out to us via our{' '}
            <Link href="https://help.safe.global" passHref target="_blank" rel="noopener noreferrer">
              <ExternalLink>Help Center</ExternalLink>
            </Link>
          </Typography>
        ) : (
          <>
            {/* Error may be undefined despite what the type says */}
            <Typography color="error">{error?.toString()}</Typography>
            <Typography color="error">{componentStack}</Typography>
          </>
        )}
        <Typography mt={2}>
          <Link href={AppRoutes.welcome} passHref color="primary">
            <MuiLink
              onClick={(e) => {
                e.stopPropagation()

                // We need to wait for navigation to finish otherwise error will be thrown
                // from the current page again
                router.push(AppRoutes.welcome).then(resetError)
              }}
            >
              Go Home
            </MuiLink>
          </Link>
        </Typography>
      </div>
    </div>
  )
}

export default ErrorBoundary
