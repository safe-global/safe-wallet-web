import { sameAddress } from '@/utils/addresses'
import type { TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { getTransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import useAsync from './useAsync'
import useChainId from './useChainId'
import useSafeInfo from './useSafeInfo'

/**
 * @returns TransactionDetails for transaction id in url
 */
export const useTxDetails = (txId?: string): [TransactionDetails | undefined, Error | undefined, boolean] => {
  const chainId = useChainId()
  const { safe, safeAddress } = useSafeInfo()

  const [txDetails, txDetailsError, txDetailsLoading] = useAsync<TransactionDetails>(
    () => {
      if (!txId) return
      return getTransactionDetails(chainId, txId)
    },
    [txId, safe.txQueuedTag, safe.txHistoryTag],
    false,
  )
  const isCurrentSafeTx = sameAddress(txDetails?.safeAddress, safeAddress)

  const error = !txId
    ? new Error("Couldn't retrieve the transaction details. Please review the URL.")
    : !isCurrentSafeTx
    ? new Error(`Transaction with id ${txId} not found in this Safe`)
    : txDetailsError

  return [txDetails, error, txDetailsLoading]
}
