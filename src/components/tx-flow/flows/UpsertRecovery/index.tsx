import type { ReactElement } from 'react'

import TxLayout from '@/components/tx-flow/common/TxLayout'
import RecoveryPlus from '@/public/images/common/recovery-plus.svg'
import useTxStepper from '../../useTxStepper'
import { UpsertRecoveryFlowReview as UpsertRecoveryFlowReview } from './UpsertRecoveryFlowReview'
import { UpsertRecoveryFlowSettings as UpsertRecoveryFlowSettings } from './UpsertRecoveryFlowSettings'
import { UpsertRecoveryFlowIntro as UpsertRecoveryFlowIntro } from './UpsertRecoveryFlowIntro'
import { DAY_IN_SECONDS } from './useRecoveryPeriods'
import type { RecoveryState } from '@/services/recovery/recovery-state'

const Subtitles = ['How does recovery work?', 'Set up recovery settings', 'Set up account recovery']

export enum UpsertRecoveryFlowFields {
  guardian = 'guardian',
  txCooldown = 'txCooldown',
  txExpiration = 'txExpiration',
}

export type UpsertRecoveryFlowProps = {
  [UpsertRecoveryFlowFields.guardian]: string
  [UpsertRecoveryFlowFields.txCooldown]: string
  [UpsertRecoveryFlowFields.txExpiration]: string
}

export function UpsertRecoveryFlow({ delayModifier }: { delayModifier?: RecoveryState[number] }): ReactElement {
  const { data, step, nextStep, prevStep } = useTxStepper<UpsertRecoveryFlowProps>({
    [UpsertRecoveryFlowFields.guardian]: delayModifier?.guardians?.[0] ?? '',
    [UpsertRecoveryFlowFields.txCooldown]: delayModifier?.txCooldown?.toString() ?? `${DAY_IN_SECONDS * 28}`, // 28 days in seconds
    [UpsertRecoveryFlowFields.txExpiration]: delayModifier?.txExpiration?.toString() ?? '0',
  })

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
      isRecovery={!isIntro}
    >
      {steps}
    </TxLayout>
  )
}
