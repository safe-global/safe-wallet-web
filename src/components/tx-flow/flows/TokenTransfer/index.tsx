import TxLayout from '@/components/tx-flow/common/TxLayout'
import useTxStepper from '../../useTxStepper'
import CreateTokenTransfer from './CreateTokenTransfer'
import ReviewTokenTransfer from './ReviewTokenTransfer'

export enum TokenTransferType {
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
  [TokenTransferFields.type]: TokenTransferType
}

type TokenTransferFlowProps = Partial<TokenTransferParams> & {
  txNonce?: number
}

const defaultData: TokenTransferParams = {
  recipient: '',
  tokenAddress: '',
  amount: '',
  type: TokenTransferType.multiSig,
}

const TokenTransferFlow = (props: TokenTransferFlowProps) => {
  const { data, step, nextStep, prevStep } = useTxStepper<TokenTransferParams>({
    ...props,
    ...defaultData,
  })

  const steps = [
    <CreateTokenTransfer
      key={0}
      params={data}
      txNonce={props.txNonce}
      onSubmit={(formData) => nextStep({ ...data, ...formData })}
    />,

    <ReviewTokenTransfer key={1} params={data} txNonce={props.txNonce} onSubmit={() => null} />,
  ]

  return (
    <TxLayout title="Send tokens" step={step} onBack={prevStep}>
      {steps}
    </TxLayout>
  )
}

export default TokenTransferFlow
