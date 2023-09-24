import type { ReactElement } from 'react'
import type { Delay } from '@gnosis.pm/zodiac'
import type { TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'

import TxLayout from '@/components/tx-flow/common/TxLayout'
import { ReviewCancelRecovery } from '@/components/tx-flow/flows/CancelRecovery/ReviewCancelRecovery'

export function CancelRecovery({
  delayModifier,
  recovery,
}: {
  delayModifier: Delay
  recovery: TransactionAddedEvent
}): ReactElement {
  // TODO: Icon
  return (
    <TxLayout title="New transaction" subtitle="Cancel recovery">
      <ReviewCancelRecovery delayModifier={delayModifier} recovery={recovery} />
    </TxLayout>
  )
}
