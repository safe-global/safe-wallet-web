import { type ReactElement } from 'react'
import { type SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import TxModal, { TxModalProps } from '@/components/tx/TxModal'
import SendNftForm from './SendNftForm'
import ReviewNftTx from './ReviewNftTx'

export type NftTransferParams = {
  recipient: string
  token: SafeCollectibleResponse
}

export const NftTransferSteps: TxStepperProps['steps'] = [
  {
    label: 'Send NFT',
    render: (data, onSubmit) => <SendNftForm onSubmit={onSubmit} params={data as NftTransferParams} />,
  },
  {
    label: 'Review transaction',
    render: (data, onSubmit) => <ReviewNftTx onSubmit={onSubmit} params={data as NftTransferParams} />,
  },
]

const NftTransferModal = (props: Omit<TxModalProps, 'steps'>): ReactElement => {
  return <TxModal {...props} steps={NftTransferSteps} />
}

export default NftTransferModal
