import { useEffect, useMemo } from 'react'
import useChainId from './useChainId'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { useAppDispatch, useAppSelector } from '@/store'
import { addDraftTx, removeDraftTx, selectDraftTxsByChainId } from '@/store/draftTxsSlice'
import type { Transaction, TransactionListItem, TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { getTransactionQueue } from '@gnosis.pm/safe-react-gateway-sdk'
import useAsync from './useAsync'
import useSafeInfo from './useSafeInfo'
import { isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'
import useTxQueue from './useTxQueue'

export const useInitDraftTransactions = () => {
  const chainId = useChainId()
  const dispatch = useAppDispatch()

  // Add a draft tx
  useEffect(() => {
    return txSubscribe(TxEvent.DRAFT_CREATED, ({ txId }) => {
      dispatch(addDraftTx({ chainId, txId }))
    })
  }, [chainId, dispatch])

  // Remove a draft when it's signed
  useEffect(() => {
    return txSubscribe(TxEvent.SIGNATURE_PROPOSED, ({ txId }) => {
      dispatch(removeDraftTx({ chainId, txId }))
    })
  }, [chainId, dispatch])

  // Remove a draft when it's executed
  useEffect(() => {
    return txSubscribe(TxEvent.PROCESSING, ({ txId }) => {
      if (txId) {
        dispatch(removeDraftTx({ chainId, txId }))
      }
    })
  }, [chainId, dispatch])
}

const useDraftTransactions = (
  pageUrl?: string,
): {
  page?: TransactionListPage
  error?: string
  loading: boolean
} => {
  const chainId = useChainId()
  const { safeAddress, safeLoaded } = useSafeInfo()
  const draftTxs = useAppSelector((state) => selectDraftTxsByChainId(state, chainId))

  // If pageUrl is passed, load a new queue page from the API
  const [page, dataError, dataLoading] = useAsync<TransactionListPage>(
    () => {
      if (!safeLoaded || !draftTxs.length) return
      return getTransactionQueue(chainId, safeAddress, pageUrl, false)
    },
    [chainId, safeAddress, safeLoaded, pageUrl, draftTxs],
    false,
  )

  const loading = !safeLoaded || dataLoading
  const error = dataError?.message

  return useMemo(() => {
    if (page) {
      const transactions = page.results.filter(isTransactionListItem)
      const results = draftTxs
        .map((id) => transactions.find((item) => item.transaction.id === id))
        .filter(Boolean) as Transaction[]

      page.results = results as TransactionListItem[]
    }
    return { page, error, loading }
  }, [page, error, loading, draftTxs])
}

export default useDraftTransactions

export const useLatestDraftNonce = (): number => {
  const { safe } = useSafeInfo()
  const { page: draftsPage } = useDraftTransactions()
  const { page: queuePage } = useTxQueue()

  const latestNonce = useMemo(() => {
    if (!safe || !draftsPage || !queuePage) return safe.nonce

    const allResults = draftsPage.results.concat(queuePage.results)

    return allResults.reduce((acc, item) => {
      if (isTransactionListItem(item) && isMultisigExecutionInfo(item.transaction.executionInfo)) {
        const { nonce } = item.transaction.executionInfo
        return nonce > acc ? nonce : acc
      }
      return acc
    }, safe.nonce - 1)
  }, [safe, draftsPage, queuePage])

  return latestNonce + 1
}
