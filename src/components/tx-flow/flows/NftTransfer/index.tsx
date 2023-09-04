import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import NftIcon from '@/public/images/common/nft.svg'
import TxLayout from '@/components/tx-flow/common/TxLayout'
import useTxStepper from '../../useTxStepper'
import SendNftBatch from './SendNftBatch'
import ReviewNftBatch from './ReviewNftBatch'

export type NftTransferParams = {
  recipient: string
  tokens: SafeCollectibleResponse[]
}

type NftTransferFlowProps = Partial<NftTransferParams> & {
  txNonce?: number
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
    <TxLayout
      title={step === 0 ? 'New transaction' : 'Confirm transaction'}
      subtitle="Send NFTs"
      icon={NftIcon}
      step={step}
      onBack={prevStep}
    >
      {steps}
    </TxLayout>
  )
}

export default NftTransferFlow
