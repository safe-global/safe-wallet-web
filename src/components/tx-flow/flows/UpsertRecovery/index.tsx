import UpsertRecoveryFlowEmail from '@/components/tx-flow/flows/UpsertRecovery/UpsertRecoveryFlowEmail'
import { SETUP_RECOVERY_CATEGORY } from '@/services/analytics/events/recovery'
import type { ReactElement } from 'react'

import TxLayout from '@/components/tx-flow/common/TxLayout'
import RecoveryPlus from '@/public/images/common/recovery-plus.svg'
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded'
import useTxStepper from '../../useTxStepper'
import { UpsertRecoveryFlowReview as UpsertRecoveryFlowReview } from './UpsertRecoveryFlowReview'
import { UpsertRecoveryFlowSettings as UpsertRecoveryFlowSettings } from './UpsertRecoveryFlowSettings'
import { UpsertRecoveryFlowIntro as UpsertRecoveryFlowIntro } from './UpsertRecoveryFlowIntro'
import { DAY_IN_SECONDS } from './useRecoveryPeriods'
import type { RecoveryState } from '@/features/recovery/services/recovery-state'

export enum UpsertRecoveryFlowFields {
  recoverer = 'recoverer',
  delay = 'delay',
  expiry = 'expiry',
  emailAddress = 'emailAddress',
}

export type UpsertRecoveryFlowProps = {
  [UpsertRecoveryFlowFields.recoverer]: string
  [UpsertRecoveryFlowFields.delay]: string
  [UpsertRecoveryFlowFields.expiry]: string
  [UpsertRecoveryFlowFields.emailAddress]?: string
}

function UpsertRecoveryFlow({ delayModifier }: { delayModifier?: RecoveryState[number] }): ReactElement {
  const { data, step, nextStep, prevStep } = useTxStepper<UpsertRecoveryFlowProps>(
    {
      [UpsertRecoveryFlowFields.recoverer]: delayModifier?.recoverers?.[0] ?? '',
      [UpsertRecoveryFlowFields.delay]: delayModifier?.delay?.toString() ?? `${DAY_IN_SECONDS * 28}`, // 28 days in seconds
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
    !delayModifier ? (
      <UpsertRecoveryFlowEmail params={data} onSubmit={(formData) => nextStep({ ...data, ...formData })} />
    ) : null,
    <UpsertRecoveryFlowReview key={2} params={data} moduleAddress={delayModifier?.address} />,
  ]

  const Subtitles = [
    'How does recovery work?',
    'Set up recovery settings',
    !delayModifier ? 'Enable email notifications' : null,
    'Set up account recovery',
  ]

  const isIntro = step === 0
  const isEmailStep = step === 2 && !delayModifier

  const icon = isIntro ? undefined : isEmailStep ? MailOutlineRoundedIcon : RecoveryPlus

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

export default UpsertRecoveryFlow
