import { useEffect } from 'react'
import {
  getTransactionHistory,
  type SafeIncomingTransfersResponse,
  type SafeModuleTransactionsResponse,
  type SafeMultisigTransactionsResponse,
  type TransactionListPage,
} from '@gnosis.pm/safe-react-gateway-sdk'
import { useRouter } from 'next/router'
import useAsync, { type AsyncResult } from '../useAsync'
import { Errors, logError } from '@/services/exceptions'
import useSafeInfo from '../useSafeInfo'
import { getFilteredTxHistory, hasTxFilterQuery } from '@/components/transactions/TxFilterForm/utils'

export const useLoadTxHistory = (): AsyncResult<TransactionListPage> => {
  const router = useRouter()

  const { safe, safeAddress, safeLoaded } = useSafeInfo()
  const { chainId, txHistoryTag } = safe

  // Re-fetch when chainId/address, or txHistoryTag change
  const [data, error, loading] = useAsync<
    | TransactionListPage
    | SafeIncomingTransfersResponse
    | SafeMultisigTransactionsResponse
    | SafeModuleTransactionsResponse
    | undefined
  >(
    async () => {
      if (!safeLoaded) return

      return hasTxFilterQuery(router.query)
        ? getFilteredTxHistory(chainId, safeAddress, router.query)
        : getTransactionHistory(chainId, safeAddress)
    },
    [safeLoaded, chainId, safeAddress, txHistoryTag, router.query],
    false,
  )

  // Log errors
  useEffect(() => {
    if (!error) return
    logError(Errors._602, error.message)
  }, [error])

  return [data, error, loading]
}

export default useLoadTxHistory
