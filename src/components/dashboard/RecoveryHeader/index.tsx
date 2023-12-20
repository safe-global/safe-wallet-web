import { Grid } from '@mui/material'
import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'

import { useRecoveryQueue } from '@/features/recovery/hooks/useRecoveryQueue'
import { useIsRecoverer } from '@/features/recovery/hooks/useIsRecoverer'
import madProps from '@/utils/mad-props'
import { FEATURES } from '@/utils/chains'
import { useHasFeature } from '@/hooks/useChains'
import { RecoveryProposalCard } from '@/features/recovery/components/RecoveryCards/RecoveryProposalCard'
import { RecoveryInProgressCard } from '@/features/recovery/components/RecoveryCards/RecoveryInProgressCard'
import { WidgetContainer, WidgetBody } from '../styled'
import { RecoveryEvent, RecoveryTxType, recoverySubscribe } from '@/features/recovery/services/recoveryEvents'
import type { RecoveryQueueItem } from '@/features/recovery/services/recovery-state'

export function _RecoveryHeader({
  isProposalInProgress,
  isRecoverer,
  supportsRecovery,
  queue,
}: {
  isProposalInProgress: boolean
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
  ) : isRecoverer && !isProposalInProgress ? (
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

export function _useIsProposalInProgress(): boolean {
  const [isProposalSubmitting, setIsProposalSubmitting] = useState(false)
  const queue = useRecoveryQueue()

  useEffect(() => {
    const unsubFns = Object.values(RecoveryEvent).map((event) =>
      recoverySubscribe(event, (detail) => {
        const isProposal = 'txType' in detail && detail.txType === RecoveryTxType.PROPOSAL
        const isProcessing = event === RecoveryEvent.PROCESSING
        const isLoaded = queue.some((item) => item.args.txHash === detail?.recoveryTxHash)

        setIsProposalSubmitting(isProposal && (isProcessing || !isLoaded))
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [queue])

  return isProposalSubmitting
}

// Appease TypeScript
const _useSupportedRecovery = () => useHasFeature(FEATURES.RECOVERY)

export const RecoveryHeader = madProps(_RecoveryHeader, {
  isProposalInProgress: _useIsProposalInProgress,
  isRecoverer: useIsRecoverer,
  supportsRecovery: _useSupportedRecovery,
  queue: useRecoveryQueue,
})
