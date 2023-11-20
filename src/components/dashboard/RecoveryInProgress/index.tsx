import { Box, Card, Grid, Skeleton, Typography } from '@mui/material'
import { useMemo } from 'react'
import type { ReactElement } from 'react'

import { useAppSelector } from '@/store'
import { useBlockTimestamp } from '@/hooks/useBlockTimestamp'
import { WidgetContainer, WidgetBody } from '../styled'
import RecoveryPending from '@/public/images/common/recovery-pending.svg'
import ExternalLink from '@/components/common/ExternalLink'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'
import { selectRecovery, selectRecoverySlice } from '@/store/recoverySlice'
import type { RecoveryState } from '@/store/recoverySlice'
import madProps from '@/utils/mad-props'

export function _RecoveryInProgress({
  blockTimestamp,
  supportsRecovery,
  recovery,
}: {
  blockTimestamp?: number
  supportsRecovery: boolean
  recovery: RecoveryState
}): ReactElement | null {
  const recoverySlice = useAppSelector(selectRecoverySlice)
  const allRecoveryTxs = useMemo(() => {
    return recoverySlice.data.flatMap(({ queue }) => queue).sort((a, b) => a.timestamp - b.timestamp)
  }, [recoverySlice.data])

  if (!supportsRecovery) {
    return null
  }

  if (!blockTimestamp || recoverySlice.loading) {
    return (
      <Grid item xs={12}>
        <Skeleton variant="rounded" height="137px" width="100%" />
      </Grid>
    )
  }

  const nonExpiredTxs = allRecoveryTxs.filter((delayedTx) => {
    return delayedTx.expiresAt ? delayedTx.expiresAt.gt(blockTimestamp) : true
  })

  if (nonExpiredTxs.length === 0) {
    return null
  }

  const nextTx = nonExpiredTxs[0]

  // TODO: Migrate `isValid` components when https://github.com/safe-global/safe-wallet-web/issues/2758 is done
  const isValid = nextTx.validFrom.lte(blockTimestamp)
  const secondsUntilValid = nextTx.validFrom.sub(blockTimestamp).toNumber()

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
                  {isValid ? 'Account recovery possible' : 'Account recovery in progress'}
                </Typography>
                <Typography color="primary.light" mb={1}>
                  {isValid
                    ? 'The recovery process is possible. This Account can be recovered.'
                    : 'The recovery process has started. This Account will be ready to recover in:'}
                </Typography>
                <Countdown seconds={secondsUntilValid} />
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

export function _getCountdown(seconds: number): { days: number; hours: number; minutes: number } {
  const MINUTE_IN_SECONDS = 60
  const HOUR_IN_SECONDS = 60 * MINUTE_IN_SECONDS
  const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS

  const days = Math.floor(seconds / DAY_IN_SECONDS)

  const remainingSeconds = seconds % DAY_IN_SECONDS
  const hours = Math.floor(remainingSeconds / HOUR_IN_SECONDS)
  const minutes = Math.floor((remainingSeconds % HOUR_IN_SECONDS) / MINUTE_IN_SECONDS)

  return { days, hours, minutes }
}

function Countdown({ seconds }: { seconds: number }): ReactElement | null {
  if (seconds <= 0) {
    return null
  }

  const { days, hours, minutes } = _getCountdown(seconds)

  return (
    <Box display="flex" gap={1}>
      <TimeLeft value={days} unit="day" />
      <TimeLeft value={hours} unit="hr" />
      <TimeLeft value={minutes} unit="min" />
    </Box>
  )
}

function TimeLeft({ value, unit }: { value: number; unit: string }): ReactElement | null {
  if (value === 0) {
    return null
  }

  return (
    <div>
      <Typography fontWeight={700} component="span">
        {value}
      </Typography>{' '}
      <Typography color="primary.light" component="span">
        {value === 1 ? unit : `${unit}s`}
      </Typography>
    </div>
  )
}

// Appease React TypeScript warnings
const _useSupportsRecovery = () => useHasFeature(FEATURES.RECOVERY)
const _useRecovery = () => useAppSelector(selectRecovery)

export const RecoveryInProgress = madProps(_RecoveryInProgress, {
  blockTimestamp: useBlockTimestamp,
  supportsRecovery: _useSupportsRecovery,
  recovery: _useRecovery,
})
