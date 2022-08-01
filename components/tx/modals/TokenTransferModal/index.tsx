import React from 'react'

import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import SendAssetsForm, { SendAssetsFormData } from '@/components/tx/modals/TokenTransferModal/SendAssetsForm'
import ReviewTokenTx from '@/components/tx/modals/TokenTransferModal/ReviewTokenTx'
import TxModal, { TxModalProps } from '@/components/tx/TxModal'

export const TokenTransferSteps: TxStepperProps['steps'] = [
  {
    label: 'Send tokens',
    render: (data, onSubmit) => <SendAssetsForm onSubmit={onSubmit} formData={data as SendAssetsFormData} />,
  },
  {
    label: 'Review transaction',
    render: (data, onSubmit) => <ReviewTokenTx params={data as SendAssetsFormData} onSubmit={onSubmit} />,
  },
]

const TokenTransferModal = (props: Omit<TxModalProps, 'steps'>) => {
  return <TxModal {...props} steps={TokenTransferSteps} />
}

export default TokenTransferModal
