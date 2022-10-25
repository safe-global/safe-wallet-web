import React, { useEffect, useState } from 'react'
import type { BigNumber } from 'ethers'

import ConnectWalletStep from '@/components/create-safe/steps/ConnectWalletStep'
import SetNameStep from '@/components/create-safe/steps/SetNameStep'
import OwnerPolicyStep from '@/components/create-safe/steps/OwnerPolicyStep'
import ReviewStep from '@/components/create-safe/steps/ReviewStep'
import { useRouter } from 'next/router'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import VerticalTxStepper from '@/components/tx/TxStepper/vertical'
import { AppRoutes } from '@/config/routes'
import { CreationStatus } from '@/components/create-safe/status/CreationStatus'
import { usePendingSafe } from '@/components/create-safe/usePendingSafe'
import useChainId from '@/hooks/useChainId'
import type { SafeFormData } from '@/components/create-safe/types.d'
import { CREATE_SAFE_CATEGORY } from '@/services/analytics'

export type PendingSafeTx = {
  data: string
  from: string
  nonce: number
  to: string
  value: BigNumber
  startBlock: number
}

export type PendingSafeData = SafeFormData & { txHash?: string; tx?: PendingSafeTx; saltNonce: number }
export type PendingSafeByChain = Record<string, PendingSafeData | undefined>

export const CreateSafeSteps: TxStepperProps['steps'] = [
  {
    label: 'Connect wallet & select network',
    render: (_, onSubmit, onBack) => <ConnectWalletStep onSubmit={onSubmit} onBack={onBack} />,
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
]

const CreateSafe = () => {
  const [pendingSafe, setPendingSafe] = usePendingSafe()
  const chainId = useChainId()
  // We need this additional state to avoid hydration errors
  const [safeCreationPending, setSafeCreationPending] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    setSafeCreationPending(!!pendingSafe)
  }, [pendingSafe, chainId])

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
    <VerticalTxStepper
      steps={CreateSafeSteps}
      onClose={onClose}
      onFinish={onFinish}
      eventCategory={CREATE_SAFE_CATEGORY}
    />
  )
}

export default CreateSafe
