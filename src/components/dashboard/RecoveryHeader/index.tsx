import { Grid } from '@mui/material'
import type { ReactElement } from 'react'

import { useRecoveryQueue } from '@/hooks/useRecoveryQueue'
import { useIsGuardian } from '@/hooks/useIsGuardian'
import madProps from '@/utils/mad-props'
import { FEATURES } from '@/utils/chains'
import { useHasFeature } from '@/hooks/useChains'
import { RecoveryProposal } from '@/components/recovery/RecoveryModal/RecoveryProposal'
import { RecoveryInProgress } from '@/components/recovery/RecoveryModal/RecoveryInProgress'
import { WidgetContainer, WidgetBody } from '../styled'
import type { RecoveryQueueItem } from '@/store/recoverySlice'

export function _RecoveryHeader({
  isGuardian,
  supportsRecovery,
  queue,
}: {
  isOwner: boolean
  isGuardian: boolean
  supportsRecovery: boolean
  queue: Array<RecoveryQueueItem>
}): ReactElement | null {
  const next = queue[0]

  if (!supportsRecovery) {
    return null
  }

  const modal = next ? (
    <RecoveryInProgress variant="widget" recovery={next} />
  ) : isGuardian ? (
    <RecoveryProposal variant="widget" />
  ) : null

  if (modal) {
    return (
      <Grid item xs={12}>
        <WidgetContainer>
          <WidgetBody>{modal}</WidgetBody>
        </WidgetContainer>
      </Grid>
    )
  }
  return null
}

// Appease TypeScript
const _useSupportedRecovery = () => useHasFeature(FEATURES.RECOVERY)

export const RecoveryHeader = madProps(_RecoveryHeader, {
  isGuardian: useIsGuardian,
  supportsRecovery: _useSupportedRecovery,
  queue: useRecoveryQueue,
})
