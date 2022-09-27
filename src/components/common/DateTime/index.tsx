import { ReactElement } from 'react'
import { Tooltip } from '@mui/material'
import { formatDateTime, formatTimeInWords } from '@/utils/date'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'

const DAYS_THRESHOLD = 60

const DateTime = ({ value }: { value: number }): ReactElement => {
  const router = useRouter()
  const isHistory = router.pathname.includes(AppRoutes.transactions.history)

  const isOld = Math.floor((Date.now() - value) / 1000 / 60 / 60 / 24) > DAYS_THRESHOLD

  const displayExactDate = isOld || isHistory

  return (
    <Tooltip title={displayExactDate ? '' : formatDateTime(value)} placement="top">
      <span>{displayExactDate ? formatDateTime(value) : formatTimeInWords(value)}</span>
    </Tooltip>
  )
}

export default DateTime
