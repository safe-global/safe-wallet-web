import { useEffect, useState } from 'react'
import { getTransactionQueue, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppDispatch, useAppSelector } from '@/store'
import useAsync from './useAsync'
import { Errors, logError } from '@/services/exceptions'
import { selectTxQueue, setQueue, selectQueuedTransactionsByNonce } from '@/store/txQueueSlice'
import useSafeInfo from './useSafeInfo'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'

export const useInitTxQueue = (): void => {
  const { safe } = useSafeInfo()
  const dispatch = useAppDispatch()
  const [reloadCount, setReloadCount] = useState<number>(0)
  const { chainId, txQueuedTag } = safe || {}
  const address = safe?.address.value

  // Re-fetch assets when chainId/address, or txQueueTag change
  const [page, error] = useAsync<TransactionListPage | undefined>(async () => {
    if (chainId && address) {
      return getTransactionQueue(chainId, address)
    }
  }, [txQueuedTag, chainId, address, reloadCount])

  // Clear the old TxQueue when Safe address is changed
  useEffect(() => {
    dispatch(setQueue(undefined))
  }, [address, chainId, dispatch])

  // Save the TxQueue in the store
  useEffect(() => {
    if (page) {
      dispatch(setQueue({
        page,
        loading: false
      }))
    }
  }, [page, dispatch])

  // Log errors
  useEffect(() => {
    if (!error) return
    logError(Errors._603, error.message)
  }, [error])

  // Refresh the queue when a new tx is submitted
  useEffect(() => {
    return txSubscribe(TxEvent.PROPOSED, () => {
      setReloadCount((prev) => prev + 1)
    })
  }, [])
}

const useTxQueue = (pageUrl?: string): {
  page?: TransactionListPage,
  error?: Error,
  loading: boolean,
 } => {
  const { safe } = useSafeInfo()
  const [ chainId, address ] = [ safe?.chainId, safe?.address.value ]

  // If pageUrl is passed, load a new queue page from the API
  const [page, error, loading] = useAsync<TransactionListPage | undefined>(async () => {
    if (!pageUrl || !chainId || !address) return
    return getTransactionQueue(chainId, address, pageUrl)
  }, [chainId, address, pageUrl])

  // The latest page of the queue is always in the store
  const queueState = useAppSelector(selectTxQueue)

  // Return the new page or the stored page
  return pageUrl ? { page, error, loading } : queueState
}

export const useQueuedTxByNonce = (nonce?: number) => {
  return useAppSelector((state) => selectQueuedTransactionsByNonce(state, nonce))
}

export default useTxQueue
