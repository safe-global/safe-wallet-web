import {
  getTransactionQueue,
  type TransactionListItem,
  type TransactionListPage,
} from '@gnosis.pm/safe-react-gateway-sdk'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'store'
import { selectSafeInfo } from '@/store/safeInfoSlice'
import { GATEWAY_URL } from '@/config/constants'
import useAsync from './useAsync'
import { Errors, logError } from './exceptions'
import { selectTxQueue, setQueuePage, setPageUrl } from '@/store/txQueueSlice'

const loadTxQueue = (chainId: string, address: string, pageUrl?: string) => {
  return getTransactionQueue(GATEWAY_URL, chainId, address, pageUrl)
}

const useTxQueue = (): void => {
  const { safe } = useAppSelector(selectSafeInfo)
  const { pageUrl } = useAppSelector(selectTxQueue)
  const dispatch = useAppDispatch()
  const { chainId, txQueuedTag } = safe
  const address = safe.address.value

  // Re-fetch assets when pageUrl, chainId/address, or txQueueTag change
  const [data, error] = useAsync<TransactionListPage | undefined>(async () => {
    if (chainId && address) {
      return loadTxQueue(chainId, address, pageUrl)
    }
  }, [txQueuedTag, chainId, address, pageUrl])

  // Clear the old TxQueue when Safe address is changed
  useEffect(() => {
    dispatch(setQueuePage(undefined))
    dispatch(setPageUrl(undefined))
  }, [address, chainId])

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

export default useTxQueue
