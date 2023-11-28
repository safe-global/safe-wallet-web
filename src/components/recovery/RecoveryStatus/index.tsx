import { SvgIcon, Typography } from '@mui/material'
import { useContext } from 'react'
import type { ReactElement } from 'react'

import ClockIcon from '@/public/images/common/clock.svg'
import { useRecoveryTxState } from '@/hooks/useRecoveryTxState'
import type { RecoveryQueueItem } from '@/services/recovery/recovery-state'
import { PendingStatus } from '@/store/pendingTxsSlice'
import { RecoveryContext } from '../RecoveryContext'

const STATUS_LABELS: Partial<Record<PendingStatus, string>> = {
  [PendingStatus.SUBMITTING]: 'Submitting',
  [PendingStatus.PROCESSING]: 'Processing',
}

export const RecoveryStatus = ({ recovery }: { recovery: RecoveryQueueItem }): ReactElement => {
  const { isExecutable, isExpired } = useRecoveryTxState(recovery)
  const { pending } = useContext(RecoveryContext)

  const status = pending?.[recovery.transactionHash] ? (
    STATUS_LABELS[pending[recovery.transactionHash]]
  ) : isExecutable ? (
    'Awaiting execution'
  ) : isExpired ? (
    'Expired'
  ) : (
    <>
      <SvgIcon component={ClockIcon} inheritViewBox color="warning" fontSize="inherit" sx={{ mr: 0.5 }} />
      Pending
    </>
  )

  return (
    <>
      <Typography
        variant="caption"
        fontWeight="bold"
        color={isExpired ? 'error.main' : 'warning.main'}
        display="inline-flex"
        alignItems="center"
      >
        {status}
      </Typography>
    </>
  )
}
