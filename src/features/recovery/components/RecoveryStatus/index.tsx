import { CircularProgress, SvgIcon, Typography } from '@mui/material'
import { useContext } from 'react'
import type { ReactElement } from 'react'

import ClockIcon from '@/public/images/common/clock.svg'
import { useRecoveryTxState } from '@/features/recovery/hooks/useRecoveryTxState'
import { RecoveryEvent } from '@/features/recovery/services/recoveryEvents'
import { RecoveryContext } from '../RecoveryContext'
import type { RecoveryQueueItem } from '@/features/recovery/services/recovery-state'

const STATUS_LABELS: Partial<Record<RecoveryEvent, string>> = {
  [RecoveryEvent.PROCESSING]: 'Processing',
  [RecoveryEvent.PROCESSED]: 'Loading',
}

export const RecoveryStatus = ({ recovery }: { recovery: RecoveryQueueItem }): ReactElement => {
  const { isExecutable, isExpired } = useRecoveryTxState(recovery)
  const { pending } = useContext(RecoveryContext)

  const pendingTxStatus = pending?.[recovery.args.txHash]?.status

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
