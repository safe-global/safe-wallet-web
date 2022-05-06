import { getTransactionQueue, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import useAsync from './useAsync'
import { Errors, logError } from './exceptions'
import { selectTxQueue, setQueuePage, setPageUrl, selectQueuedTransactionsByNonce } from '@/store/txQueueSlice'
import useSafeInfo from './useSafeInfo'

export const useInitTxQueue = (): void => {
  const { safe } = useSafeInfo()
  const { pageUrl } = useTxQueue()
  const dispatch = useAppDispatch()
  const { chainId, txQueuedTag } = safe || {}
  const address = safe?.address.value

  // Re-fetch assets when pageUrl, chainId/address, or txQueueTag change
  const [data, error] = useAsync<TransactionListPage | undefined>(async () => {
    if (chainId && address) {
      return getTransactionQueue(chainId, address, pageUrl)
    }
  }, [txQueuedTag, chainId, address, pageUrl])

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
    logError(Errors._602, error.message)
  }, [error])
}

const useTxQueue = () => {
  return useAppSelector(selectTxQueue)
}

export const useQueuedTxByNonce = (nonce?: number) => {
  return useAppSelector((state) => selectQueuedTransactionsByNonce(state, nonce))
}

export default useTxQueue
