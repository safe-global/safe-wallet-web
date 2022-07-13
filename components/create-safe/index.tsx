import React, { useEffect, useState } from 'react'

import ConnectWalletStep from '@/components/create-safe/steps/ConnectWalletStep'
import SetNameStep from '@/components/create-safe/steps/SetNameStep'
import OwnerPolicyStep from '@/components/create-safe/steps/OwnerPolicyStep'
import ReviewStep from '@/components/create-safe/steps/ReviewStep'
import { useRouter } from 'next/router'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import VerticalTxStepper from '@/components/tx/TxStepper/vertical'
import { AppRoutes } from '@/config/routes'
import { CreationStatus } from '@/components/create-safe/status/CreationStatus'
import { usePendingSafe } from '@/components/create-safe/usePendingSafe'

export type Owner = {
  name: string
  address: string
  resolving: boolean
}

export type CreateSafeFormData = {
  name: string
  threshold: number
  owners: Owner[]
}

export type PendingSafeData = CreateSafeFormData & { txHash?: string; saltNonce: number }

export const CreateSafeSteps: TxStepperProps['steps'] = [
  {
    label: 'Connect wallet & select network',
    render: (data, onSubmit, onBack) => <ConnectWalletStep onSubmit={onSubmit} onBack={onBack} />,
  },
  {
    label: 'Name',
    render: (data, onSubmit, onBack, setStep) => (
      <SetNameStep params={data as CreateSafeFormData} onSubmit={onSubmit} onBack={onBack} setStep={setStep} />
    ),
  },
  {
    label: 'Owners and Confirmations',
    render: (data, onSubmit, onBack, setStep) => (
      <OwnerPolicyStep params={data as CreateSafeFormData} onSubmit={onSubmit} onBack={onBack} setStep={setStep} />
    ),
  },
  {
    label: 'Review',
    render: (data, onSubmit, onBack, setStep) => (
      <ReviewStep params={data as CreateSafeFormData} onSubmit={onSubmit} onBack={onBack} setStep={setStep} />
    ),
  },
]

const CreateSafe = () => {
  const [pendingSafe, setPendingSafe] = usePendingSafe()
  const [safeCreationPending, setSafeCreationPending] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    setSafeCreationPending(!!pendingSafe)
  }, [pendingSafe])

  const onFinish = () => {
    setSafeCreationPending(true)
  }

  const onClose = () => {
    setPendingSafe(undefined)
    router.push(AppRoutes.welcome)
  }

  return safeCreationPending ? (
    <CreationStatus onClose={onClose} />
  ) : (
    <VerticalTxStepper steps={CreateSafeSteps} onClose={onClose} onFinish={onFinish} />
  )
}

export default CreateSafe
