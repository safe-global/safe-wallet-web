import { useEffect, useState } from 'react'
import { getTransactionQueue, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppDispatch, useAppSelector } from '@/store'
import useAsync from './useAsync'
import { Errors, logError } from './exceptions'
import { selectTxQueue, setQueuePage, setPageUrl, selectQueuedTransactionsByNonce } from '@/store/txQueueSlice'
import useSafeInfo from './useSafeInfo'
import { TxEvent, txSubscribe } from './tx/txEvents'

export const useInitTxQueue = (): void => {
  const { safe } = useSafeInfo()
  const { pageUrl } = useTxQueue()
  const dispatch = useAppDispatch()
  const [reloadCount, setReloadCount] = useState<number>(0)
  const { chainId, txQueuedTag } = safe || {}
  const address = safe?.address.value

  // Re-fetch assets when pageUrl, chainId/address, or txQueueTag change
  const [data, error] = useAsync<TransactionListPage | undefined>(async () => {
    if (chainId && address) {
      return getTransactionQueue(chainId, address, pageUrl)
    }
  }, [txQueuedTag, chainId, address, pageUrl, reloadCount])

  // Clear the old TxQueue when Safe address is changed
  useEffect(() => {
    dispatch(setQueuePage(undefined))
    dispatch(setPageUrl(undefined))
  }, [address, chainId, dispatch])

  // Save the TxQueue in the store
  useEffect(() => {
    if (data) dispatch(setQueuePage(data))
  }, [data, dispatch])

  // Log errors
  useEffect(() => {
    if (!error) return
    logError(Errors._603, error.message)
  }, [error])

  // Refresh the queue when a new tx is submitted
  useEffect(() => {
    // Don't reload the queue if we're not on the first page
    if (pageUrl) return

    return txSubscribe(TxEvent.PROPOSED, () => {
      setReloadCount((prev) => prev + 1)
    })
  }, [pageUrl])
}

const useTxQueue = () => {
  return useAppSelector(selectTxQueue)
}

export const useQueuedTxByNonce = (nonce?: number) => {
  return useAppSelector((state) => selectQueuedTransactionsByNonce(state, nonce))
}

export default useTxQueue
