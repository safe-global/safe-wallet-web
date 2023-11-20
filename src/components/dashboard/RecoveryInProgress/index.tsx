import { Box, Card, Grid, Typography } from '@mui/material'
import { useMemo } from 'react'
import type { ReactElement } from 'react'

import { useAppSelector } from '@/store'
import { useBlockTimestamp } from '@/hooks/useBlockTimestamp'
import { WidgetContainer, WidgetBody } from '../styled'
import RecoveryPending from '@/public/images/common/recovery-pending.svg'
import ExternalLink from '@/components/common/ExternalLink'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'
import { selectRecovery } from '@/store/recoverySlice'
import type { RecoveryState } from '@/store/recoverySlice'
import madProps from '@/utils/mad-props'
import { getCountdown } from '@/utils/date'

export function _RecoveryInProgress({
  blockTimestamp,
  supportsRecovery,
  recovery,
}: {
  blockTimestamp?: number
  supportsRecovery: boolean
  recovery: RecoveryState
}): ReactElement | null {
  const allRecoveryTxs = useMemo(() => {
    return recovery.flatMap(({ queue }) => queue).sort((a, b) => a.timestamp - b.timestamp)
  }, [recovery])

  if (!supportsRecovery || !blockTimestamp) {
    return null
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

function Countdown({ seconds }: { seconds: number }): ReactElement | null {
  if (seconds <= 0) {
    return null
  }

  const { days, hours, minutes } = getCountdown(seconds)

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
const _useBlockTimestamp = () => useBlockTimestamp(60_000) // Countdown does not display
const _useSupportsRecovery = () => useHasFeature(FEATURES.RECOVERY)
const _useRecovery = () => useAppSelector(selectRecovery)

export const RecoveryInProgress = madProps(_RecoveryInProgress, {
  blockTimestamp: _useBlockTimestamp,
  supportsRecovery: _useSupportsRecovery,
  recovery: _useRecovery,
})
