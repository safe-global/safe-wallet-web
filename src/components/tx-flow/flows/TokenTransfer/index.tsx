import merge from 'lodash/merge'
import TxLayout from '@/components/tx-flow/common/TxLayout'
import useTxStepper from '../../useTxStepper'
import CreateTokenTransfer from './CreateTokenTransfer'
import ReviewTokenTransfer from './ReviewTokenTransfer'
import { useMemo } from 'react'

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

const TokenTransferFlow = ({ txNonce, ...params }: TokenTransferFlowProps) => {
  const initialData = useMemo(() => merge({}, defaultData, params), [params])

  const { data, step, nextStep, prevStep } = useTxStepper<[TokenTransferParams, TokenTransferParams | undefined]>([
    initialData,
    undefined,
  ])

  const steps = [
    <CreateTokenTransfer
      key={0}
      params={data[0]}
      txNonce={txNonce}
      onSubmit={(formData) => nextStep([formData, formData])}
    />,

    data[1] && <ReviewTokenTransfer key={1} params={data[1]} txNonce={txNonce} onSubmit={() => null} />,
  ]

  return (
    <TxLayout title="Send tokens" step={step} onBack={prevStep}>
      {steps}
    </TxLayout>
  )
}

export default TokenTransferFlow
