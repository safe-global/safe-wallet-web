import type { ReactElement } from 'react'

import TxLayout from '../../common/TxLayout'
import { SkipRecoveryFlowReview } from './SkipRecoveryFlowReview'
import type { RecoveryQueueItem } from '@/components/recovery/RecoveryLoaderContext'

export function SkipRecoveryFlow({ recovery }: { recovery: RecoveryQueueItem }): ReactElement {
  return (
    <TxLayout title="Confirm transaction" subtitle="Skip recovery" step={0}>
      <SkipRecoveryFlowReview recovery={recovery} />
    </TxLayout>
  )
}
