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

const NftTransferFlow = (props: NftTransferParams) => {
  const { data, step, nextStep, prevStep } = useTxStepper<NftTransferParams>(props)

  const steps = [
    <SendNftBatch key={0} params={data} onSubmit={(formData) => nextStep(formData)} onBack={() => prevStep(data)} />,

    <ReviewNftBatch key={1} params={data} onSubmit={() => {}} />,
  ]

  return (
    <TxLayout title="Send tokens" step={step}>
      {steps}
    </TxLayout>
  )
}

export default NftTransferFlow
