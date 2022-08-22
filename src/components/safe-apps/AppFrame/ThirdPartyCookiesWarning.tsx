import React from 'react'
import { Alert, Link, AlertTitle } from '@mui/material'

type ThirdPartyCookiesWarningProps = {
  onClose: () => void
}

const HELP_LINK =
  'https://help.gnosis-safe.io/en/articles/5955031-why-do-i-need-to-enable-third-party-cookies-for-safe-apps'

export const ThirdPartyCookiesWarning = ({ onClose }: ThirdPartyCookiesWarningProps): React.ReactElement => {
  return (
    <Alert
      severity="warning"
      onClose={onClose}
      sx={({ palette }) => ({
        background: palette.warning.light,
        border: 0,
        borderBottom: `1px solid ${palette.warning.main}`,
        borderRadius: '0px !important',
      })}
    >
      <AlertTitle>
        Third party cookies are disabled. Safe Apps may therefore not work properly. You can find out more information
        about this{' '}
        <Link href={HELP_LINK} target="_blank" fontSize="inherit">
          here
        </Link>
      </AlertTitle>
    </Alert>
  )
}
