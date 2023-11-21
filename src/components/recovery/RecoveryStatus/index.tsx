import { SvgIcon, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import ClockIcon from '@/public/images/common/clock.svg'
import { useRecoveryTxState } from '@/hooks/useRecoveryTxState'
import type { RecoveryQueueItem } from '@/store/recoverySlice'

export const RecoveryStatus = ({ recovery }: { recovery: RecoveryQueueItem }): ReactElement => {
  const { isExecutable, isExpired } = useRecoveryTxState(recovery)

  return (
    <>
      <Typography
        variant="caption"
        fontWeight="bold"
        color={isExpired ? 'error.main' : 'warning.main'}
        display="inline-flex"
        alignItems="center"
      >
        {isExecutable ? (
          'Awaiting execution'
        ) : isExpired ? (
          'Expired'
        ) : (
          <>
            <SvgIcon component={ClockIcon} inheritViewBox color="warning" fontSize="inherit" sx={{ mr: 0.5 }} />
            Pending
          </>
        )}
      </Typography>
    </>
  )
}
