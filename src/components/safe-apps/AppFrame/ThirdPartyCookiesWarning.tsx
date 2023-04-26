import React from 'react'
import { Alert, AlertTitle } from '@mui/material'
import ExternalLink from '@/components/common/ExternalLink'

type ThirdPartyCookiesWarningProps = {
  onClose: () => void
}

const HELP_LINK =
  'https://help.safe.global/en/articles/5955031-why-do-i-need-to-enable-third-party-cookies-for-safe-apps'

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
        <ExternalLink href={HELP_LINK} fontSize="inherit">
          here
        </ExternalLink>
      </AlertTitle>
    </Alert>
  )
}
