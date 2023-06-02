import TxLayout from '@/components/tx-flow/common/TxLayout'
import useTxStepper from '../../useTxStepper'
import CreateTokenTransfer from './CreateTokenTransfer'
import ReviewTokenTransfer from './ReviewTokenTransfer'

export enum SendTxType {
  multiSig = 'multiSig',
  spendingLimit = 'spendingLimit',
}

export type TokenTransferParams = {
  txNonce?: number
  recipient?: string
  tokenAddress?: string
  amount?: string
  type?: SendTxType
}

const TokenTransferFlow = (props: TokenTransferParams) => {
  const { data, step, nextStep, prevStep } = useTxStepper<[TokenTransferParams, TokenTransferParams]>([props, props])

  const steps = [
    <CreateTokenTransfer
      key={0}
      params={data[0]}
      onSubmit={(formData) => nextStep<1>(formData)}
      onBack={() => /* close modal */ null}
    />,

    <ReviewTokenTransfer key={1} params={data[1]} onSubmit={() => undefined} onBack={prevStep} />,
  ]

  return (
    <TxLayout title="Send tokens" step={step}>
      {steps}
    </TxLayout>
  )
}

export default TokenTransferFlow
