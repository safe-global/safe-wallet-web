import { useTokenTransferStepper } from '@/components/new-tx/TokenTransfer/index'
import useBalances from '@/hooks/useBalances'
import useAsync from '@/hooks/useAsync'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { createTokenTransferParams } from '@/services/tx/tokenTransferParams'
import { createTx } from '@/services/tx/tx-sender'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { TokenTransferReview } from '@/components/tx/modals/TokenTransferModal/ReviewTokenTx'
import SendFromBlock from '@/components/tx/SendFromBlock'
import SendToBlock from '@/components/tx/SendToBlock'

const ReviewTokenTransfer = ({ txNonce }: { txNonce?: number }) => {
  const { onSubmit, mergedValues, values } = useTokenTransferStepper()
  const { balances } = useBalances()

  const token = balances.items.find((item) => item.tokenInfo.address === mergedValues.tokenAddress)
  const { decimals, address } = token?.tokenInfo || {}

  // Create a safeTx
  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    if (!address || typeof decimals === 'undefined') return
    const txParams = createTokenTransferParams(mergedValues.recipient, mergedValues.amount, decimals, address)
    return createTx(txParams, txNonce)
  }, [mergedValues, decimals, address])

  console.log(mergedValues, values)

  return (
    <SignOrExecuteForm safeTx={safeTx} onSubmit={() => onSubmit(mergedValues)} error={safeTxError}>
      {token && <TokenTransferReview amount={mergedValues.amount} tokenInfo={token.tokenInfo} />}

      <SendFromBlock />

      <SendToBlock address={mergedValues.recipient} />
    </SignOrExecuteForm>
  )
}

export default ReviewTokenTransfer
