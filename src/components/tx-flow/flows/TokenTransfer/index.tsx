import TxLayout from '@/components/tx-flow/common/TxLayout'
import useTxStepper from '../../useTxStepper'
import CreateTokenTransfer from './CreateTokenTransfer'
import ReviewTokenTransfer from './ReviewTokenTransfer'
import AssetsIcon from '@/public/images/sidebar/assets.svg'

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

const defaultParams: TokenTransferParams = {
  recipient: '',
  tokenAddress: '',
  amount: '',
  type: TokenTransferType.multiSig,
}

const TokenTransferFlow = ({ txNonce, ...params }: TokenTransferFlowProps) => {
  const { data, step, nextStep, prevStep } = useTxStepper<TokenTransferParams>({
    ...defaultParams,
    ...params,
  })

  const steps = [
    <CreateTokenTransfer
      key={0}
      params={data}
      txNonce={txNonce}
      onSubmit={(formData) => nextStep({ ...data, ...formData })}
    />,

    <ReviewTokenTransfer key={1} params={data} txNonce={txNonce} onSubmit={() => null} />,
  ]

  return (
    <TxLayout title="New transaction" subtitle="Send tokens" icon={AssetsIcon} step={step} onBack={prevStep}>
      {steps}
    </TxLayout>
  )
}

export default TokenTransferFlow
