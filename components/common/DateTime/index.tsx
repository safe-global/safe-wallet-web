import { ReactElement } from 'react'
import { Tooltip } from '@mui/material'
import { formatDateTime, formatTimeInWords } from '@/utils/date'

const DAYS_THRESHOLD = 60

const DateTime = ({ value }: { value: number }): ReactElement => {
  const displayExactDate = Math.floor((Date.now() - value) / 1000 / 60 / 60 / 24) > DAYS_THRESHOLD

  return (
    <Tooltip title={displayExactDate ? '' : formatDateTime(value)} placement="top">
      <span>{displayExactDate ? formatDateTime(value) : formatTimeInWords(value)}</span>
    </Tooltip>
  )
}

export default DateTime
