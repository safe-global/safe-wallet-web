import { type ReactElement } from 'react'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import TxModal, { TxModalProps } from '@/components/tx/TxModal'
import SendNftForm, { type SendNftFormData } from './SendNftForm'
import ReviewNftTx from './ReviewNftTx'

export const NftTransferSteps: TxStepperProps['steps'] = [
  {
    label: 'Send NFT',
    render: (data, onSubmit) => <SendNftForm onSubmit={onSubmit} formData={data as SendNftFormData} />,
  },
  {
    label: 'Review transaction',
    render: (data, onSubmit) => <ReviewNftTx params={data as SendNftFormData} onSubmit={onSubmit} />,
  },
]

const NftTransferModal = (props: Omit<TxModalProps, 'steps'>): ReactElement => {
  return <TxModal {...props} steps={NftTransferSteps} />
}

export default NftTransferModal
