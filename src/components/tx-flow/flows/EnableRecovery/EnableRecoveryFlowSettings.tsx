import type { ReactElement } from 'react'

import TxCard from '../../common/TxCard'
import type { EnableRecoveryFlowProps } from '.'

export function EnableRecoveryFlowSettings({
  params,
  onSubmit,
}: {
  params: EnableRecoveryFlowProps
  onSubmit: (formData: EnableRecoveryFlowProps) => void
}): ReactElement {
  return <TxCard>EnableRecoveryFlowSettings</TxCard>
}
