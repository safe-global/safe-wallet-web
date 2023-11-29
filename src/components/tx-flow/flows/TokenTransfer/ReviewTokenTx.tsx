import { useCallback, type ReactElement } from 'react'
import { type TokenTransferParams, TokenTransferType } from '@/components/tx-flow/flows/TokenTransfer/index'
import ReviewTokenTransfer from '@/components/tx-flow/flows/TokenTransfer/ReviewTokenTransfer'
import ReviewSpendingLimitTx from '@/components/tx-flow/flows/TokenTransfer/ReviewSpendingLimitTx'
import { TX_EVENTS, TX_TYPES } from '@/services/analytics/events/transactions'
import { trackEvent } from '@/services/analytics'
import { type SubmitCallback } from '@/components/tx/SignOrExecuteForm'

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

  const onTxSubmit = useCallback<SubmitCallback>(
    (_, isExecuted) => {
      trackEvent({ ...TX_EVENTS.CREATE, label: TX_TYPES.transfer_token })
      if (isExecuted) {
        trackEvent({ ...TX_EVENTS.EXECUTE, label: TX_TYPES.transfer_token })
      }
      onSubmit()
    },
    [onSubmit],
  )

  return isSpendingLimitTx ? (
    <ReviewSpendingLimitTx params={params} onSubmit={onTxSubmit} />
  ) : (
    <ReviewTokenTransfer params={params} onSubmit={onTxSubmit} txNonce={txNonce} />
  )
}

export default ReviewTokenTx
