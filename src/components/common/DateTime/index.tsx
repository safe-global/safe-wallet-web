import { ReactElement } from 'react'
import { Tooltip } from '@mui/material'
import { formatDateTime, formatTimeInWords } from '@/utils/date'
import { isToday, startOfDay } from 'date-fns'

const DAYS_THRESHOLD = 60

const getRelevantTimestamp = (value: number) => {
  return isToday(new Date(value)) ? value : startOfDay(value).getTime()
}

const DateTime = ({ value }: { value: number }): ReactElement => {
  const displayExactDate = Math.floor((Date.now() - value) / 1000 / 60 / 60 / 24) > DAYS_THRESHOLD

  return (
    <Tooltip title={displayExactDate ? '' : formatDateTime(value)} placement="top">
      <span>{displayExactDate ? formatDateTime(value) : formatTimeInWords(getRelevantTimestamp(value))}</span>
    </Tooltip>
  )
}

export default DateTime
