import { type ReactElement } from 'react'
import { type TokenTransferParams, TokenTransferType } from '@/components/tx-flow/flows/TokenTransfer/index'
import ReviewTokenTransfer from '@/components/tx-flow/flows/TokenTransfer/ReviewTokenTransfer'
import ReviewSpendingLimitTx from '@/components/tx-flow/flows/TokenTransfer/ReviewSpendingLimitTx'

// TODO: Split this into separate flows
const ReviewTokenTx = ({
  params,
  onSubmit,
  txNonce,
}: {
  params: TokenTransferParams
  onSubmit: () => void
  txNonce?: number
}): ReactElement => {
  const isSpendingLimitTx = params.type === TokenTransferType.spendingLimit

  return isSpendingLimitTx ? (
    <ReviewSpendingLimitTx params={params} onSubmit={onSubmit} />
  ) : (
    <ReviewTokenTransfer params={params} onSubmit={onSubmit} txNonce={txNonce} />
  )
}

export default ReviewTokenTx
