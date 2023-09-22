import type { Delay } from '@gnosis.pm/zodiac'
import type { ReactElement } from 'react'

import TxLayout from '@/components/tx-flow/common/TxLayout'
import { ReviewAddRecoverer } from '@/components/tx-flow/flows/AddRecoverer/ReviewAddRecoverer'
import { ChooseRecoverer } from '@/components/tx-flow/flows/AddRecoverer/ChooseRecoverer'
import useTxStepper from '../../useTxStepper'

export type AddRecovererFlowProps = {
  recoverer: string
}

export function AddRecoverer({ delayModifier }: { delayModifier: Delay }): ReactElement {
  const { data, step, nextStep, prevStep } = useTxStepper<AddRecovererFlowProps>({
    recoverer: '',
  })

  const steps = [
    <ChooseRecoverer key={0} params={data} onSubmit={(formData) => nextStep({ ...data, ...formData })} />,
    <ReviewAddRecoverer key={1} delayModifier={delayModifier} params={data} />,
  ]

  // TODO: Icon
  return (
    <TxLayout
      title={step === 0 ? 'New transaction' : 'Confirm transaction'}
      subtitle="Add recoverer"
      step={step}
      onBack={prevStep}
    >
      {steps}
    </TxLayout>
  )
}
