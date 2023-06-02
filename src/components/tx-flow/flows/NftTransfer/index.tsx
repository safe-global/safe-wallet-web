import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import TxLayout from '@/components/tx-flow/common/TxLayout'
import useTxStepper from '../../useTxStepper'
import SendNftBatch from './SendNftBatch'
import ReviewNftBatch from './ReviewNftBatch'

export type NftTransferParams = {
  txNonce?: number
  recipient?: string
  tokens?: SafeCollectibleResponse[]
}

export type SubmittedNftTransferParams = NftTransferParams & {
  recipient: string
  tokens: SafeCollectibleResponse[]
}

type NftTransferFlowProps = NftTransferParams & {
  txNonce?: number
}

const NftTransferFlow = ({ txNonce, ...params }: NftTransferFlowProps) => {
  const { data, step, nextStep, prevStep } = useTxStepper<[NftTransferParams, SubmittedNftTransferParams | undefined]>([
    params,
    undefined,
  ])

  const steps = [
    <SendNftBatch key={0} params={data[0]} onSubmit={(formData) => nextStep<1>(formData)} />,

    data[1] && <ReviewNftBatch key={1} params={data[1]} txNonce={txNonce} onSubmit={() => null} onBack={prevStep} />,
  ]

  return (
    <TxLayout title="Send tokens" step={step}>
      {steps}
    </TxLayout>
  )
}

export default NftTransferFlow
