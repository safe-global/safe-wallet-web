import React from 'react'

import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import type { SendAssetsFormData } from '@/components/tx/modals/TokenTransferModal/SendAssetsForm'
import SendAssetsForm from '@/components/tx/modals/TokenTransferModal/SendAssetsForm'
import ReviewTokenTx from '@/components/tx/modals/TokenTransferModal/ReviewTokenTx'
import type { TxModalProps } from '@/components/tx/TxModal'
import TxModal from '@/components/tx/TxModal'

export const TokenTransferSteps: TxStepperProps['steps'] = [
  {
    label: 'Send tokens',
    render: (data, onSubmit) => <SendAssetsForm onSubmit={onSubmit} formData={data as SendAssetsFormData} />,
  },
  {
    label: 'Review transaction',
    render: (data, onSubmit) => <ReviewTokenTx onSubmit={onSubmit} params={data as SendAssetsFormData} />,
  },
]

const TokenTransferModal = (props: Omit<TxModalProps, 'steps'>) => {
  return <TxModal {...props} steps={TokenTransferSteps} />
}

export default TokenTransferModal
