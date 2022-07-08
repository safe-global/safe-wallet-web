import React, { useEffect, useState } from 'react'

import ConnectWallet from '@/components/create-safe/ConnectWallet'
import SetName from '@/components/create-safe/SetName'
import OwnerPolicy from '@/components/create-safe/OwnerPolicy'
import Review from '@/components/create-safe/Review'
import { useRouter } from 'next/router'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import VerticalTxStepper from '@/components/tx/TxStepper/vertical'
import { AppRoutes } from '@/config/routes'
import { CreationStatus } from '@/components/create-safe/CreationStatus'
import { usePendingSafe } from '@/components/create-safe/usePendingSafe'

export const SAFE_PENDING_CREATION_STORAGE_KEY = 'NEW_SAFE_PENDING_CREATION_STORAGE_KEY'

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
    render: (data, onSubmit, onBack) => <ConnectWallet onSubmit={onSubmit} onBack={onBack} />,
  },
  {
    label: 'Name',
    render: (data, onSubmit, onBack) => <SetName onSubmit={onSubmit} onBack={onBack} />,
  },
  {
    label: 'Owners and Confirmations',
    render: (data, onSubmit, onBack) => (
      <OwnerPolicy params={data as CreateSafeFormData} onSubmit={onSubmit} onBack={onBack} />
    ),
  },
  {
    label: 'Review',
    render: (data, onSubmit, onBack) => (
      <Review params={data as CreateSafeFormData} onSubmit={onSubmit} onBack={onBack} />
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
