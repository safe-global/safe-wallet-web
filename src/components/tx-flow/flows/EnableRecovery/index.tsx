import type { ReactElement } from 'react'

import TxLayout from '@/components/tx-flow/common/TxLayout'
import RecoveryPlus from '@/public/images/common/recovery-plus.svg'
import useTxStepper from '../../useTxStepper'
import { EnableRecoveryFlowReview } from './EnableRecoveryFlowReview'
import { EnableRecoveryFlowSettings } from './EnableRecoveryFlowSettings'
import { EnableRecoveryFlowIntro } from './EnableRecoveryFlowIntro'

const DAY_SECONDS = 60 * 60 * 24

export const RecoveryDelayPeriods = [
  {
    label: '2 days',
    value: `${DAY_SECONDS}`,
  },
  {
    label: '7 days',
    value: `${DAY_SECONDS * 7}`,
  },
  {
    label: '14 days',
    value: `${DAY_SECONDS * 14}`,
  },
  {
    label: '28 days',
    value: `${DAY_SECONDS * 28}`,
  },
  {
    label: '56 days',
    value: `${DAY_SECONDS * 56}`,
  },
] as const

export const RecoveryExpirationPeriods = [
  {
    label: 'Never',
    value: '0',
  },
  ...RecoveryDelayPeriods,
] as const

const Subtitles = ['How does recovery work?', 'Set up recovery settings', 'Set up account recovery']

export enum EnableRecoveryFlowFields {
  guardians = 'guardians',
  txCooldown = 'txCooldown',
  txExpiration = 'txExpiration',
  emailAddress = 'emailAddress',
}

export type EnableRecoveryFlowProps = {
  [EnableRecoveryFlowFields.guardians]: string
  [EnableRecoveryFlowFields.txCooldown]: string
  [EnableRecoveryFlowFields.txExpiration]: string
  [EnableRecoveryFlowFields.emailAddress]: string
}

export function EnableRecoveryFlow(): ReactElement {
  const { data, step, nextStep, prevStep } = useTxStepper<EnableRecoveryFlowProps>({
    [EnableRecoveryFlowFields.guardians]: '',
    [EnableRecoveryFlowFields.txCooldown]: `${DAY_SECONDS * 28}`, // 28 days in seconds
    [EnableRecoveryFlowFields.txExpiration]: '0',
    [EnableRecoveryFlowFields.emailAddress]: '',
  })

  const steps = [
    <EnableRecoveryFlowIntro key={0} onSubmit={() => nextStep(data)} />,
    <EnableRecoveryFlowSettings key={1} params={data} onSubmit={(formData) => nextStep({ ...data, ...formData })} />,
    <EnableRecoveryFlowReview key={2} params={data} />,
  ]

  const isIntro = step === 0

  const icon = isIntro ? undefined : RecoveryPlus

  return (
    <TxLayout
      title="Account recovery"
      subtitle={Subtitles[step]}
      icon={icon}
      step={step}
      onBack={prevStep}
      hideNonce={isIntro}
      hideProgress={isIntro}
      isRecovery={!isIntro}
    >
      {steps}
    </TxLayout>
  )
}
