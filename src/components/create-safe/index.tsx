import React from 'react'

import ConnectWalletStep from '@/components/create-safe/steps/ConnectWalletStep'
import SetNameStep from '@/components/create-safe/steps/SetNameStep'
import OwnerPolicyStep from '@/components/create-safe/steps/OwnerPolicyStep'
import ReviewStep from '@/components/create-safe/steps/ReviewStep'
import { useRouter } from 'next/router'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import VerticalTxStepper from '@/components/tx/TxStepper/vertical'
import { AppRoutes } from '@/config/routes'
import { CreationStatus } from '@/components/create-safe/status/CreationStatus'
import type { PendingSafeData, SafeFormData } from '@/components/create-safe/types.d'
import { CREATE_SAFE_CATEGORY } from '@/services/analytics'
import css from './styles.module.css'

export const CreateSafeSteps: TxStepperProps['steps'] = [
  {
    label: 'Connect wallet & select network',
    render: (_, onSubmit, onBack, setStep) => (
      <ConnectWalletStep onSubmit={onSubmit} onBack={onBack} setStep={setStep} />
    ),
  },
  {
    label: 'Name',
    render: (data, onSubmit, onBack, setStep) => (
      <SetNameStep params={data as SafeFormData} onSubmit={onSubmit} onBack={onBack} setStep={setStep} />
    ),
  },
  {
    label: 'Owners and confirmations',
    render: (data, onSubmit, onBack, setStep) => (
      <OwnerPolicyStep params={data as SafeFormData} onSubmit={onSubmit} onBack={onBack} setStep={setStep} />
    ),
  },
  {
    label: 'Review',
    render: (data, onSubmit, onBack, setStep) => (
      <ReviewStep params={data as SafeFormData} onSubmit={onSubmit} onBack={onBack} setStep={setStep} />
    ),
  },
  {
    label: 'Status',
    render: (data, onSubmit, onBack, setStep) => (
      <CreationStatus params={data as PendingSafeData} onSubmit={onSubmit} onBack={onBack} setStep={setStep} />
    ),
  },
]

const CreateSafe = () => {
  const router = useRouter()

  const onClose = () => {
    router.push(AppRoutes.welcome)
  }

  return (
    <div className={css.stepper}>
      <VerticalTxStepper steps={CreateSafeSteps} onClose={onClose} eventCategory={CREATE_SAFE_CATEGORY} />
    </div>
  )
}

export default CreateSafe
