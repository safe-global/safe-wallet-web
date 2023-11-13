import { Box, Typography, SvgIcon, Alert } from '@mui/material'
import type { ReactElement } from 'react'

import LightbulbIcon from '@/public/images/common/lightbulb.svg'

import infoWidgetCss from 'src/components/new-safe/create/InfoWidget/styles.module.css'

export function EnableRecoveryFlowEmailHint(): ReactElement {
  return (
    <Alert severity="info" sx={{ border: 'unset', p: 3 }} icon={false}>
      <Box className={infoWidgetCss.title} sx={{ backgroundColor: ({ palette }) => palette.info.main }}>
        <SvgIcon component={LightbulbIcon} inheritViewBox className={infoWidgetCss.titleIcon} />
        <Typography variant="caption">
          <b>Security tip</b>
        </Typography>
      </Box>
      <Typography variant="body2" mt={2}>
        For security reasons, we highly recommend adding an email address. You will be notified once a Guardian
        initiates recovery and be able to reject it if it&apos;s a malicious attempt.
      </Typography>
    </Alert>
  )
}
