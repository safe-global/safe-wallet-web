import { Grid } from '@mui/material'
import type { ReactElement } from 'react'

import { useRecoveryQueue } from '@/hooks/useRecoveryQueue'
import { useIsGuardian } from '@/hooks/useIsGuardian'
import madProps from '@/utils/mad-props'
import { FEATURES } from '@/utils/chains'
import { useHasFeature } from '@/hooks/useChains'
import { RecoveryProposalCard } from '@/components/recovery/RecoveryCards/RecoveryProposalCard'
import { RecoveryInProgressCard } from '@/components/recovery/RecoveryCards/RecoveryInProgressCard'
import { WidgetContainer, WidgetBody } from '../styled'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import type { RecoveryQueueItem } from '@/components/recovery/RecoveryContext'

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
    <RecoveryInProgressCard orientation="horizontal" recovery={next} />
  ) : isGuardian ? (
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
  isGuardian: useIsGuardian,
  supportsRecovery: _useSupportedRecovery,
  queue: useRecoveryQueue,
})
