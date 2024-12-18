import { REMOVE_RECOVERY_CATEGORY } from '@/services/analytics/events/recovery'
import type { ReactElement } from 'react'

import TxLayout from '@/components/tx-flow/common/TxLayout'
import RecoveryPlus from '@/public/images/common/recovery-plus.svg'
import useTxStepper from '../../useTxStepper'
import { RemoveRecoveryFlowOverview } from './RemoveRecoveryFlowOverview'
import { RemoveRecoveryFlowReview } from './RemoveRecoveryFlowReview'
import type { RecoveryStateItem } from '@/features/recovery/services/recovery-state'

export type RecoveryFlowProps = {
  delayModifier: RecoveryStateItem
}

function RemoveRecoveryFlow({ delayModifier }: RecoveryFlowProps): ReactElement {
  const { step, nextStep, prevStep } = useTxStepper<undefined>(undefined, REMOVE_RECOVERY_CATEGORY)

  const steps = [
    <RemoveRecoveryFlowOverview key={0} delayModifier={delayModifier} onSubmit={() => nextStep(undefined)} />,
    <RemoveRecoveryFlowReview key={1} delayModifier={delayModifier} />,
  ]

  return (
    <TxLayout
      title={step === 0 ? 'Remove Account recovery' : 'Confirm transaction'}
      subtitle="Remove Recoverer"
      icon={RecoveryPlus}
      step={step}
      onBack={prevStep}
    >
      {steps}
    </TxLayout>
  )
}

export default RemoveRecoveryFlow
