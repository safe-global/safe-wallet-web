import { useCallback, useMemo } from 'react'
import {
  type TransactionListPage,
  type TransactionSummary,
  type LabelValue,
  getTransactionQueue,
  TransactionListItemType,
} from '@safe-global/safe-gateway-typescript-sdk'
import { useAppDispatch, useAppSelector } from '@/store'
import useChainId from './useChainId'
import useAsync from './useAsync'
import useSafeAddress from './useSafeAddress'
import { isTransactionListItem } from '@/utils/transaction-guards'
import { replaceBatch, selectBatchBySafe } from '@/store/batchSlice'

export const useBatchTxId = (): TransactionSummary['id'] | null => {
  const chainId = useChainId()
  const safeAddress = useSafeAddress()
  const batchTxId = useAppSelector((state) => selectBatchBySafe(state, chainId, safeAddress))
  return batchTxId
}

export const useUpdateBatch = () => {
  const chainId = useChainId()
  const safeAddress = useSafeAddress()
  const dispatch = useAppDispatch()

  return useCallback(
    (txId: TransactionSummary['id']) => {
      dispatch(replaceBatch({ chainId, safeAddress, txId }))
    },
    [dispatch, chainId, safeAddress],
  )
}

export const useDraftBatchTxs = (): {
  page?: TransactionListPage
  error?: string
  loading: boolean
} => {
  const chainId = useChainId()
  const safeAddress = useSafeAddress()
  const txId = useBatchTxId()

  const [untrustedQueue, error, loading] = useAsync<TransactionListPage>(() => {
    if (!txId) return
    return getTransactionQueue(chainId, safeAddress, undefined, false)
  }, [chainId, safeAddress, txId])

  const batchTxPage = useMemo(() => {
    if (!untrustedQueue || !txId) return

    // Find the batch txs in the "untrusted" queue by id
    const results = untrustedQueue.results.filter((item) => isTransactionListItem(item) && item.transaction.id === txId)

    results.unshift({
      type: TransactionListItemType.LABEL,
      label: 'Batch' as LabelValue,
    })

    return results.length ? { results } : undefined
  }, [untrustedQueue, txId])

  return useMemo(
    () => ({
      page: batchTxPage,
      error: error?.message,
      loading,
    }),
    [batchTxPage, error, loading],
  )
}
