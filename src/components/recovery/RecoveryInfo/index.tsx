import { SvgIcon, Tooltip } from '@mui/material'
import type { ReactElement } from 'react'

import WarningIcon from '@/public/images/notifications/warning.svg'

export const RecoveryInfo = (): ReactElement => {
  return (
    <Tooltip title="Suspicious activity" placement="top" arrow>
      <span>
        <SvgIcon component={WarningIcon} inheritViewBox color="error" />
      </span>
    </Tooltip>
  )
}
