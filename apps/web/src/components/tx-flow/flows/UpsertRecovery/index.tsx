import { SETUP_RECOVERY_CATEGORY } from '@/services/analytics/events/recovery'
import type { ReactElement } from 'react'

import TxLayout from '@/components/tx-flow/common/TxLayout'
import RecoveryPlus from '@/public/images/common/recovery-plus.svg'
import useTxStepper from '../../useTxStepper'
import { UpsertRecoveryFlowReview as UpsertRecoveryFlowReview } from './UpsertRecoveryFlowReview'
import { UpsertRecoveryFlowSettings as UpsertRecoveryFlowSettings } from './UpsertRecoveryFlowSettings'
import { UpsertRecoveryFlowIntro as UpsertRecoveryFlowIntro } from './UpsertRecoveryFlowIntro'
import { DAY_IN_SECONDS } from './useRecoveryPeriods'
import type { RecoveryState } from '@/features/recovery/services/recovery-state'

const Subtitles = ['How does recovery work?', 'Set up recovery settings', 'Set up account recovery']

export enum UpsertRecoveryFlowFields {
  recoverer = 'recoverer',
  delay = 'delay',
  customDelay = 'customDelay',
  selectedDelay = 'selectedDelay',
  expiry = 'expiry',
}

export type UpsertRecoveryFlowProps = {
  [UpsertRecoveryFlowFields.recoverer]: string
  [UpsertRecoveryFlowFields.delay]: string
  [UpsertRecoveryFlowFields.customDelay]: string
  [UpsertRecoveryFlowFields.selectedDelay]: string
  [UpsertRecoveryFlowFields.expiry]: string
}

function UpsertRecoveryFlow({ delayModifier }: { delayModifier?: RecoveryState[number] }): ReactElement {
  const { data, step, nextStep, prevStep } = useTxStepper<UpsertRecoveryFlowProps>(
    {
      [UpsertRecoveryFlowFields.recoverer]: delayModifier?.recoverers?.[0] ?? '',
      [UpsertRecoveryFlowFields.delay]: '',
      [UpsertRecoveryFlowFields.selectedDelay]: delayModifier?.delay?.toString() ?? `${DAY_IN_SECONDS * 28}`, // 28 days in seconds
      [UpsertRecoveryFlowFields.customDelay]: '',
      [UpsertRecoveryFlowFields.expiry]: delayModifier?.expiry?.toString() ?? '0',
    },
    SETUP_RECOVERY_CATEGORY,
  )

  const steps = [
    <UpsertRecoveryFlowIntro key={0} onSubmit={() => nextStep(data)} />,
    <UpsertRecoveryFlowSettings
      key={1}
      params={data}
      delayModifier={delayModifier}
      onSubmit={(formData) => nextStep({ ...data, ...formData })}
    />,
    <UpsertRecoveryFlowReview key={2} params={data} moduleAddress={delayModifier?.address} />,
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
    >
      {steps}
    </TxLayout>
  )
}

export default UpsertRecoveryFlow
