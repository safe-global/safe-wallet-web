import { Card, Grid, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import { useAppSelector } from '@/store'
import { useTimestamp } from '@/hooks/useTimestamp'
import { WidgetContainer, WidgetBody } from '../styled'
import RecoveryPending from '@/public/images/common/recovery-pending.svg'
import ExternalLink from '@/components/common/ExternalLink'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'
import { selectAllRecoveryQueues } from '@/store/recoverySlice'
import madProps from '@/utils/mad-props'
import { Countdown } from '@/components/common/Countdown'
import { useRecoveryTxState } from '@/hooks/useRecoveryTxState'
import type { RecoveryQueueItem } from '@/store/recoverySlice'

export function _RecoveryInProgress({
  timestamp,
  supportsRecovery,
  queuedTxs,
}: {
  timestamp: number
  supportsRecovery: boolean
  queuedTxs: Array<RecoveryQueueItem>
}): ReactElement | null {
  const nonExpiredTxs = queuedTxs.filter((queuedTx) => {
    return queuedTx.expiresAt ? queuedTx.expiresAt.gt(timestamp) : true
  })

  if (!supportsRecovery || nonExpiredTxs.length === 0) {
    return null
  }

  // Conditional hook
  return <_RecoveryInProgressWidget nextTx={nonExpiredTxs[0]} />
}

function _RecoveryInProgressWidget({ nextTx }: { nextTx: RecoveryQueueItem }): ReactElement {
  const { isExecutable, isNext, remainingSeconds } = useRecoveryTxState(nextTx)

  // TODO: Migrate `isValid` components when https://github.com/safe-global/safe-wallet-web/issues/2758 is done
  return (
    <Grid item xs={12}>
      <WidgetContainer>
        <WidgetBody>
          <Card sx={{ py: 3, px: 4 }}>
            <Grid container display="flex" alignItems="center" gap={3}>
              <Grid item>
                <RecoveryPending />
              </Grid>
              <Grid item xs>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  {isExecutable ? 'Account recovery possible' : 'Account recovery in progress'}
                </Typography>
                <Typography color="primary.light" mb={1}>
                  {isExecutable
                    ? 'The recovery process is possible. This Account can be recovered.'
                    : !isNext
                    ? remainingSeconds > 0
                      ? 'The recovery process has started. This Account can be recovered after previous attempts are executed or skipped and the delay period has passed:'
                      : 'The recovery process has started. This Account can be recovered after previous attempts are executed or skipped.'
                    : 'The recovery process has started. This Account will be ready to recover in:'}
                </Typography>
                <Countdown seconds={remainingSeconds} />
              </Grid>
              <Grid item>
                <ExternalLink
                  href="#" // TODO: Link to docs
                  title="Learn about the Account recovery process"
                >
                  Learn more
                </ExternalLink>
              </Grid>
            </Grid>
          </Card>
        </WidgetBody>
      </WidgetContainer>
    </Grid>
  )
}

// Appease React TypeScript warnings
const _useTimestamp = () => useTimestamp(60_000) // Countdown does not display
const _useSupportsRecovery = () => useHasFeature(FEATURES.RECOVERY)
const _useQueuedRecoveryTxs = () => useAppSelector(selectAllRecoveryQueues)

export const RecoveryInProgress = madProps(_RecoveryInProgress, {
  timestamp: _useTimestamp,
  supportsRecovery: _useSupportsRecovery,
  queuedTxs: _useQueuedRecoveryTxs,
})
