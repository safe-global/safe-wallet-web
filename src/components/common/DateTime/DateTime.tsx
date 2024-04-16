import type { ReactElement } from 'react'
import { Tooltip } from '@mui/material'
import { formatDateTime, formatTime, formatTimeInWords } from '@/utils/date'

type DateTimeProps = {
  value: number
  showDateTime: boolean
  showTime: boolean
}

export const DateTime = ({ value, showDateTime, showTime }: DateTimeProps): ReactElement => {
  return (
    <Tooltip title={showDateTime ? '' : formatDateTime(value)} placement="top">
      <span>{showTime ? formatTime(value) : showDateTime ? formatDateTime(value) : formatTimeInWords(value)}</span>
    </Tooltip>
  )
}
