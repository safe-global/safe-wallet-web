import { CANCEL_RECOVERY_CATEGORY } from '@/services/analytics/events/recovery'
import type { ReactElement } from 'react'

import TxLayout from '../../common/TxLayout'
import { CancelRecoveryFlowReview } from './CancelRecoveryFlowReview'
import { CancelRecoveryOverview } from './CancelRecoveryOverview'
import useTxStepper from '../../useTxStepper'
import type { RecoveryQueueItem } from '@/features/recovery/services/recovery-state'

function CancelRecoveryFlow({ recovery }: { recovery: RecoveryQueueItem }): ReactElement {
  const { step, nextStep, prevStep } = useTxStepper<undefined>(undefined, CANCEL_RECOVERY_CATEGORY)

  const steps = [
    <CancelRecoveryOverview key={0} onSubmit={() => nextStep(undefined)} />,
    <CancelRecoveryFlowReview key={1} recovery={recovery} />,
  ]

  const isIntro = step === 0

  return (
    <TxLayout
      title={isIntro ? 'Cancel Account recovery' : 'New transaction'}
      subtitle={isIntro ? undefined : 'Cancel Account recovery'}
      step={step}
      hideNonce={isIntro}
      onBack={prevStep}
    >
      {steps}
    </TxLayout>
  )
}

export default CancelRecoveryFlow
