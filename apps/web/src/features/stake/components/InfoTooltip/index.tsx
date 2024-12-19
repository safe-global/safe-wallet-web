import { SvgIcon, Tooltip } from '@mui/material'
import InfoIcon from '@/public/images/notifications/info.svg'
import type { ReactNode } from 'react'

export function InfoTooltip({ title }: { title: string | ReactNode }) {
  return (
    <Tooltip title={title} arrow placement="top">
      <span>
        <SvgIcon
          component={InfoIcon}
          inheritViewBox
          color="border"
          fontSize="small"
          sx={{
            verticalAlign: 'middle',
            ml: 0.5,
          }}
        />
      </span>
    </Tooltip>
  )
}
