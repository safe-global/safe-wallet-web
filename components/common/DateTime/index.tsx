import { ReactElement } from 'react'
import { Tooltip } from '@mui/material'
import { formatDateTime, formatTimeInWords } from '@/utils/date'

const DateTime = ({ value }: { value: number }): ReactElement => {
  return (
    <Tooltip title={formatDateTime(value)} placement="top">
      <span>{formatTimeInWords(value)}</span>
    </Tooltip>
  )
}

export default DateTime
