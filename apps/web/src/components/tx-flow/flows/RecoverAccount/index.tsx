import { START_RECOVERY_CATEGORY } from '@/services/analytics/events/recovery'
import type { ReactElement } from 'react'
import type { AddressEx } from '@safe-global/safe-gateway-typescript-sdk'

import TxLayout from '@/components/tx-flow/common/TxLayout'
import SaveAddressIcon from '@/public/images/common/save-address.svg'
import useTxStepper from '../../useTxStepper'
import { RecoverAccountFlowReview } from './RecoverAccountFlowReview'
import { RecoverAccountFlowSetup } from './RecoverAccountFlowSetup'

export enum RecoverAccountFlowFields {
  owners = 'owners',
  threshold = 'threshold',
}

export type RecoverAccountFlowProps = {
  // RHF accept primitive field arrays
  [RecoverAccountFlowFields.owners]: Array<AddressEx>
  [RecoverAccountFlowFields.threshold]: string
}

function RecoverAccountFlow(): ReactElement {
  const { data, step, nextStep, prevStep } = useTxStepper<RecoverAccountFlowProps>(
    {
      [RecoverAccountFlowFields.owners]: [{ value: '' }],
      [RecoverAccountFlowFields.threshold]: '1',
    },
    START_RECOVERY_CATEGORY,
  )

  const steps = [
    <RecoverAccountFlowSetup key={0} params={data} onSubmit={(formData) => nextStep({ ...data, ...formData })} />,
    <RecoverAccountFlowReview key={1} params={data} />,
  ]

  return (
    <TxLayout
      title={step === 0 ? 'Start Account recovery' : 'Confirm transaction'}
      subtitle="Change Account settings"
      icon={SaveAddressIcon}
      step={step}
      onBack={prevStep}
      hideNonce
    >
      {steps}
    </TxLayout>
  )
}

export default RecoverAccountFlow
