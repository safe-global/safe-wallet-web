import React from 'react'

import ConnectWallet from '@/components/create-safe/ConnectWallet'
import SafeOwners from '@/components/load-safe/SafeOwners'
import { useRouter } from 'next/router'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import VerticalTxStepper from '@/components/tx/TxStepper/vertical'
import { AppRoutes } from '@/config/routes'
import SetAddress from '@/components/load-safe/SetAddress'
import { SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import SafeReview from '@/components/load-safe/SafeReview'

export type LoadSafeFormData = {
  name: string
  address: string
  safeInfo: SafeInfo
}

export const LoadSafeSteps: TxStepperProps['steps'] = [
  {
    label: 'Connect wallet & select network',
    render: (data, onSubmit, onBack) => <ConnectWallet onSubmit={onSubmit} onBack={onBack} />,
  },
  {
    label: 'Name and address',
    render: (data, onSubmit, onBack) => <SetAddress onSubmit={onSubmit} onBack={onBack} />,
  },
  {
    label: 'Owners',
    render: (data, onSubmit, onBack) => (
      <SafeOwners params={data as LoadSafeFormData} onSubmit={onSubmit} onBack={onBack} />
    ),
  },
  {
    label: 'Review',
    render: (data, onSubmit, onBack) => <SafeReview params={data as LoadSafeFormData} onBack={onBack} />,
  },
]

const LoadSafe = () => {
  const router = useRouter()

  return <VerticalTxStepper steps={LoadSafeSteps} onClose={() => router.push(AppRoutes.welcome)} />
}

export default LoadSafe
