import type { ReactElement } from 'react'

import TxLayout from '@/components/tx-flow/common/TxLayout'
import { ReviewEnableRecovery } from '@/components/tx-flow/flows/EnableRecovery/ReviewEnableRecovery'

export function EnableRecovery({ recoverers }: { recoverers: Array<string> }): ReactElement {
  // TODO: Icon
  return (
    <TxLayout title="New transaction" subtitle="Enable recovery">
      <ReviewEnableRecovery recoverers={recoverers} />
    </TxLayout>
  )
}
