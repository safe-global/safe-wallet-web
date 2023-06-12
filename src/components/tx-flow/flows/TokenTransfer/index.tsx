import merge from 'lodash/merge'
import TxLayout from '@/components/tx-flow/common/TxLayout'
import useTxStepper from '../../useTxStepper'
import CreateTokenTransfer from './CreateTokenTransfer'
import ReviewTokenTransfer from './ReviewTokenTransfer'

export enum SendTxType {
  multiSig = 'multiSig',
  spendingLimit = 'spendingLimit',
}

export enum TokenTransferFields {
  recipient = 'recipient',
  tokenAddress = 'tokenAddress',
  amount = 'amount',
  type = 'type',
}

export type TokenTransferParams = {
  [TokenTransferFields.recipient]: string
  [TokenTransferFields.tokenAddress]: string
  [TokenTransferFields.amount]: string
  [TokenTransferFields.type]: SendTxType
}

type TokenTransferFlowProps = Partial<TokenTransferParams> & {
  txNonce?: number
}

const defaultData: TokenTransferParams = {
  recipient: '',
  tokenAddress: '',
  amount: '',
  type: SendTxType.multiSig,
}

const TokenTransferFlow = ({ txNonce, ...params }: TokenTransferFlowProps) => {
  const initialData = merge({}, defaultData, params)
  const { data, step, nextStep, prevStep } = useTxStepper<[TokenTransferParams, TokenTransferParams]>([
    initialData,
    initialData,
  ])

  const steps = [
    <CreateTokenTransfer key={0} params={data[0]} txNonce={txNonce} onSubmit={nextStep} />,

    <ReviewTokenTransfer key={1} params={data[1]} txNonce={txNonce} onSubmit={() => null} onBack={prevStep} />,
  ]

  return (
    <TxLayout title="Send tokens" step={step}>
      {steps}
    </TxLayout>
  )
}

export default TokenTransferFlow
