import { Grid } from '@mui/material'
import type { ReactElement } from 'react'

import { useRecoveryQueue } from '@/hooks/useRecoveryQueue'
import { useIsRecoverer } from '@/hooks/useIsRecoverer'
import madProps from '@/utils/mad-props'
import { FEATURES } from '@/utils/chains'
import { useHasFeature } from '@/hooks/useChains'
import { RecoveryProposalCard } from '@/components/recovery/RecoveryCards/RecoveryProposalCard'
import { RecoveryInProgressCard } from '@/components/recovery/RecoveryCards/RecoveryInProgressCard'
import { WidgetContainer, WidgetBody } from '../styled'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import type { RecoveryQueueItem } from '@/services/recovery/recovery-state'

export function _RecoveryHeader({
  isRecoverer,
  supportsRecovery,
  queue,
}: {
  isOwner: boolean
  isRecoverer: boolean
  supportsRecovery: boolean
  queue: Array<RecoveryQueueItem>
}): ReactElement | null {
  const next = queue[0]

  if (!supportsRecovery) {
    return null
  }

  const modal = next ? (
    <RecoveryInProgressCard orientation="horizontal" recovery={next} />
  ) : isRecoverer ? (
    <RecoveryProposalCard orientation="horizontal" />
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
  isOwner: useIsSafeOwner,
  isRecoverer: useIsRecoverer,
  supportsRecovery: _useSupportedRecovery,
  queue: useRecoveryQueue,
})
