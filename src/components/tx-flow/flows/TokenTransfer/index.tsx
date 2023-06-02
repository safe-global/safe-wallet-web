import TxLayout from '@/components/tx-flow/common/TxLayout'
import useTxStepper from '../../useTxStepper'
import CreateTokenTransfer from './CreateTokenTransfer'
import ReviewTokenTransfer from './ReviewTokenTransfer'

export enum SendTxType {
  multiSig = 'multiSig',
  spendingLimit = 'spendingLimit',
}

export type TokenTransferParams = {
  recipient?: string
  tokenAddress?: string
  amount?: string
  type?: SendTxType
}

type TokenTransferFlowProps = TokenTransferParams & {
  txNonce?: number
}

const TokenTransferFlow = ({ txNonce, ...params }: TokenTransferFlowProps) => {
  const { data, step, nextStep, prevStep } = useTxStepper<[TokenTransferParams, TokenTransferParams]>([params, params])

  const steps = [
    <CreateTokenTransfer key={0} params={data[0]} txNonce={txNonce} onSubmit={(formData) => nextStep<1>(formData)} />,

    <ReviewTokenTransfer key={1} txNonce={txNonce} params={data[1]} onSubmit={() => null} onBack={prevStep} />,
  ]

  return (
    <TxLayout title="Send tokens" step={step}>
      {steps}
    </TxLayout>
  )
}

export default TokenTransferFlow
