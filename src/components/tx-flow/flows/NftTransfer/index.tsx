import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import TxLayout from '@/components/tx-flow/common/TxLayout'
import useTxStepper from '../../useTxStepper'
import SendNftBatch from './SendNftBatch'
import ReviewNftBatch from './ReviewNftBatch'

type NftTransferFlowProps = {
  txNonce?: number
  recipient?: string
  tokens?: SafeCollectibleResponse[]
}

export type NftTransferParams = {
  recipient: string
  tokens: SafeCollectibleResponse[]
}

const defaultParams: NftTransferParams = {
  recipient: '',
  tokens: [],
}

const NftTransferFlow = ({ txNonce, ...params }: NftTransferFlowProps) => {
  const { data, step, nextStep, prevStep } = useTxStepper<NftTransferParams>({
    ...defaultParams,
    ...params,
  })

  const steps = [
    <SendNftBatch key={0} params={data} onSubmit={(formData) => nextStep({ ...data, ...formData })} />,

    <ReviewNftBatch key={1} params={data} txNonce={txNonce} onSubmit={() => null} />,
  ]

  return (
    <TxLayout title="Send tokens" step={step} onBack={prevStep}>
      {steps}
    </TxLayout>
  )
}

export default NftTransferFlow
