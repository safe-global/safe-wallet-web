import { CircularProgress, SvgIcon, Typography } from '@mui/material'
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

  const pendingTxStatus = pending?.[recovery.args.txHash]

  const status = pendingTxStatus ? (
    <>
      <CircularProgress size={14} color="inherit" />
      {STATUS_LABELS[pendingTxStatus]}
    </>
  ) : isExecutable ? (
    'Awaiting execution'
  ) : isExpired ? (
    'Expired'
  ) : (
    <>
      <SvgIcon component={ClockIcon} inheritViewBox color="warning" fontSize="inherit" />
      Pending
    </>
  )

  return (
    <Typography
      variant="caption"
      fontWeight="bold"
      color={isExpired ? 'error.main' : 'warning.main'}
      display="inline-flex"
      alignItems="center"
      gap={1}
    >
      {status}
    </Typography>
  )
}
