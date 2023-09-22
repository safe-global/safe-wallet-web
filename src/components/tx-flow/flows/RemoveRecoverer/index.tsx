import type { Delay } from '@gnosis.pm/zodiac'
import type { ReactElement } from 'react'

import TxLayout from '@/components/tx-flow/common/TxLayout'
import { ReviewRemoveRecoverer } from '@/components/tx-flow/flows/RemoveRecoverer/ReviewRemoveRecoverer'

export function RemoveRecoverer({
  delayModifier,
  recoverer,
}: {
  delayModifier: Delay
  recoverer: string
}): ReactElement {
  // TODO: Icon
  return (
    <TxLayout title="New transaction" subtitle="Remove recoverer">
      <ReviewRemoveRecoverer delayModifier={delayModifier} recoverer={recoverer} />
    </TxLayout>
  )
}
