import SvgIcon from '@mui/material/SvgIcon'
import Tooltip from '@mui/material/Tooltip'
import type { ReactElement } from 'react'

import WarningIcon from '@/public/images/notifications/warning.svg'

export const RecoveryInfo = ({ isMalicious }: { isMalicious: boolean }): ReactElement | null => {
  if (!isMalicious) {
    return null
  }

  return (
    <Tooltip title="Suspicious activity" placement="top" arrow>
      <span>
        <SvgIcon component={WarningIcon} inheritViewBox color="error" />
      </span>
    </Tooltip>
  )
}
