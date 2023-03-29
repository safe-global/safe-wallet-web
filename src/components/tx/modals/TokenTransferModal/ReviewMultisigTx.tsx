import { type ReactElement } from 'react'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { createTokenTransferParams } from '@/services/tx/tokenTransferParams'
import useBalances from '@/hooks/useBalances'
import useAsync from '@/hooks/useAsync'
import SendToBlock from '@/components/tx/SendToBlock'
import SendFromBlock from '../../SendFromBlock'
import type { TokenTransferModalProps } from '.'
import { TokenTransferReview } from '@/components/tx/modals/TokenTransferModal/ReviewTokenTx'
import { createTx } from '@/services/tx/tx-sender'

const ReviewMultisigTx = ({ params, onSubmit }: TokenTransferModalProps): ReactElement => {
  const { balances } = useBalances()

  const token = balances.items.find((item) => item.tokenInfo.address === params.tokenAddress)
  const { decimals, address } = token?.tokenInfo || {}

  // Create a safeTx
  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    if (!address || typeof decimals === 'undefined') return
    const txParams = createTokenTransferParams(params.recipient, params.amount, decimals, address)
    return createTx(txParams, params.txNonce)
  }, [params, decimals, address])

  return (
    <SignOrExecuteForm safeTx={safeTx} onSubmit={onSubmit} error={safeTxError}>
      {token && <TokenTransferReview amount={params.amount} tokenInfo={token.tokenInfo} />}

      <SendFromBlock />

      <SendToBlock address={params.recipient} />
    </SignOrExecuteForm>
  )
}

export default ReviewMultisigTx
