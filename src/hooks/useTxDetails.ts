import { sameAddress } from '@/utils/addresses'
import type { TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { getTransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { useRouter } from 'next/router'
import useAsync from './useAsync'
import useChainId from './useChainId'
import useSafeInfo from './useSafeInfo'

/**
 * @returns TransactionDetails for transaction id in url
 */
export const useTxDetails = (): [TransactionDetails | undefined, Error | undefined, boolean] => {
  const chainId = useChainId()
  const router = useRouter()
  const { id } = router.query
  const transactionId = Array.isArray(id) ? id[0] : id
  const { safe, safeAddress } = useSafeInfo()

  const [txDetails, txDetailsError, txDetailsLoading] = useAsync<TransactionDetails>(
    () => {
      if (!transactionId) return
      return getTransactionDetails(chainId, transactionId)
    },
    [transactionId, safe.txQueuedTag, safe.txHistoryTag],
    false,
  )
  const isCurrentSafeTx = sameAddress(txDetails?.safeAddress, safeAddress)

  const error = !transactionId
    ? new Error("Couldn't retrieve the transaction details. Please review the URL.")
    : !isCurrentSafeTx
    ? new Error(`Transaction with id ${transactionId} not found in this Safe`)
    : txDetailsError

  return [txDetails, error, txDetailsLoading]
}
