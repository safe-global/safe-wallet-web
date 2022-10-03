import type { ReactElement } from 'react'
import { Tooltip } from '@mui/material'
import { formatDateTime, formatTime, formatTimeInWords } from '@/utils/date'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import { useTxFilter } from '@/utils/tx-history-filter'

const DAYS_THRESHOLD = 60

/**
 * If queue, show relative time until threshold then show full date and time
 * If history, show time (as date labels are present)
 * If filter, show full date and time
 */

const DateTime = ({ value }: { value: number }): ReactElement => {
  const [filter] = useTxFilter()
  const router = useRouter()

  // (non-filtered) history is the endpoint that returns date labels
  const showTime = router.pathname === AppRoutes.transactions.history && !filter

  const isOld = Math.floor((Date.now() - value) / 1000 / 60 / 60 / 24) > DAYS_THRESHOLD
  const showDateTime = isOld

  return (
    <Tooltip title={showDateTime ? '' : formatDateTime(value)} placement="top">
      <span>{showTime ? formatTime(value) : showDateTime ? formatDateTime(value) : formatTimeInWords(value)}</span>
    </Tooltip>
  )
}

export default DateTime
