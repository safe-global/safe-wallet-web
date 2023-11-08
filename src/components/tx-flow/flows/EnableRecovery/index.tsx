import type { ReactElement } from 'react'

import TxLayout from '@/components/tx-flow/common/TxLayout'
import CodeIcon from '@/public/images/apps/code-icon.svg'
import useTxStepper from '../../useTxStepper'
import { EnableRecoveryFlowReview } from './EnableRecoveryFlowReview'
import { EnableRecoveryFlowSettings } from './EnableRecoveryFlowSettings'
import { EnableRecoveryFlowIntro } from './EnableRecoveryFlowIntro'

export enum EnableRecoveryFlowFields {
  guardians = 'guardians',
  txCooldown = 'txCooldown',
  txExpiration = 'txExpiration',
}

export type EnableRecoveryFlowProps = {
  [EnableRecoveryFlowFields.guardians]: Array<string>
  [EnableRecoveryFlowFields.txCooldown]: string
  [EnableRecoveryFlowFields.txExpiration]: string
}

export function EnableRecoveryFlow(): ReactElement {
  const { data, step, nextStep, prevStep } = useTxStepper<EnableRecoveryFlowProps>({
    [EnableRecoveryFlowFields.guardians]: [],
    [EnableRecoveryFlowFields.txCooldown]: '0',
    [EnableRecoveryFlowFields.txExpiration]: '0',
  })

  const steps = [
    <EnableRecoveryFlowIntro key={0} />,
    <EnableRecoveryFlowSettings key={1} params={data} onSubmit={(formData) => nextStep({ ...data, ...formData })} />,
    <EnableRecoveryFlowReview key={1} params={data} />,
  ]

  const isIntro = step === 0
  const isSettings = step === 1

  const subtitle = isIntro
    ? 'How does recovery work?'
    : isSettings
    ? 'Set up account settings'
    : 'Set up account recovery'

  const icon = isIntro ? undefined : CodeIcon

  return (
    <TxLayout
      title="Account recovery"
      subtitle={subtitle}
      icon={icon}
      step={step}
      onBack={prevStep}
      hideNonce={isIntro}
    >
      {steps}
    </TxLayout>
  )
}
