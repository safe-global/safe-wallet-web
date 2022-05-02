import React from 'react'

import { TxStepperProps } from '@/components/tx/TxStepper'
import SendAssetsForm, { SendAssetsFormData } from '@/components/tx/SendAssetsForm'
import ReviewTx from '@/components/tx/ReviewTx'
import TxModal, { TxModalProps } from '@/components/tx/TxModal'

export const TokenTransferSteps: TxStepperProps['steps'] = [
  {
    label: 'Create transaction',
    render: (data, onSubmit) => <SendAssetsForm onSubmit={onSubmit} formData={data as SendAssetsFormData} />,
  },
  {
    label: 'Review',
    render: (data) => <ReviewTx params={data as SendAssetsFormData} />,
  },
]

const TokenTransferModal = ({ ...props }: Omit<TxModalProps, 'steps'>) => {
  return <TxModal {...props} steps={TokenTransferSteps} />
}

export default TokenTransferModal
