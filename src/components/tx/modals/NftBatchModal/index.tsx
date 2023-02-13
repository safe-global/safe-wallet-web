import { type ReactElement } from 'react'
import { type SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import type { TxModalProps } from '@/components/tx/TxModal'
import TxModal from '@/components/tx/TxModal'
import SendNftBatch from './SendNftBatch'
import ReviewNftBatch from './ReviewNftBatch'

export type NftTransferParams = {
  recipient: string
  tokens: SafeCollectibleResponse[]
}

export const NftTransferSteps: TxStepperProps['steps'] = [
  {
    label: 'Send NFTs',
    render: (data, onSubmit) => <SendNftBatch onSubmit={onSubmit} params={data as NftTransferParams} />,
  },
  {
    label: 'Review transaction',
    render: (data, onSubmit) => <ReviewNftBatch onSubmit={onSubmit} params={data as NftTransferParams} />,
  },
]

const NftBatchModal = (props: Omit<TxModalProps, 'steps'>): ReactElement => {
  return <TxModal {...props} steps={NftTransferSteps} />
}

export default NftBatchModal
