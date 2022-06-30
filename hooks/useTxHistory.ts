import { getTransactionHistory, TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import useAsync from './useAsync'
import { Errors, logError } from '@/services/exceptions'
import { selectTxHistory, setHistory } from '@/store/txHistorySlice'
import useSafeInfo from './useSafeInfo'

export const useInitTxHistory = (): void => {
  const { safe } = useSafeInfo()
  const dispatch = useAppDispatch()
  const { chainId, txHistoryTag } = safe || {}
  const address = safe?.address.value

  // Re-fetch assets when chainId/address, or txHistoryTag change
  const [page, error] = useAsync<TransactionListPage | undefined>(async () => {
    if (chainId && address) {
      return getTransactionHistory(chainId, address)
    }
  }, [txHistoryTag, chainId, address])

  // Clear the old TxHistory when Safe address is changed
  useEffect(() => {
    dispatch(setHistory(undefined))
  }, [address, chainId, dispatch])

  // Save the TxHistory in the store
  useEffect(() => {
    if (page) {
      dispatch(
        setHistory({
          page,
          loading: false,
        }),
      )
    }
  }, [page, dispatch])

  // Log errors
  useEffect(() => {
    if (!error) return
    logError(Errors._602, error.message)
  }, [error])
}

const useTxHistory = (
  pageUrl?: string,
): {
  page?: TransactionListPage
  error?: Error
  loading: boolean
} => {
  const { safe } = useSafeInfo()
  const [chainId, address] = [safe?.chainId, safe?.address.value]

  // If pageUrl is passed, load a new history page from the API
  const [page, error, loading] = useAsync<TransactionListPage | undefined>(async () => {
    if (!pageUrl || !chainId || !address) return
    return getTransactionHistory(chainId, address, pageUrl)
  }, [chainId, address, pageUrl])

  // The latest page of the history is always in the store
  const historyState = useAppSelector(selectTxHistory)

  // Return the new page or the stored page
  return pageUrl ? { page, error, loading } : historyState
}

export default useTxHistory
