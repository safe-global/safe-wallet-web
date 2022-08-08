import { ReactElement } from 'react'
import { Tooltip } from '@mui/material'
import { formatDateTime, formatTimeInWords } from '@/utils/date'

const DateTime = ({ value }: { value: number }): ReactElement => {
  const olderThan60Days = Math.floor((Date.now() - value) / 1000 / 60 / 60 / 24) > 60

  return (
    <Tooltip title={olderThan60Days ? '' : formatDateTime(value)} placement="top">
      <span>{olderThan60Days ? formatDateTime(value) : formatTimeInWords(value)}</span>
    </Tooltip>
  )
}

export default DateTime
