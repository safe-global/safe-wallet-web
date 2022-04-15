import { getTransactionHistory, TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'store'
import { selectSafeInfo } from 'store/safeInfoSlice'
import { GATEWAY_URL } from 'config/constants'
import useAsync from './useAsync'
import { Errors, logError } from './exceptions'
import { selectTxHistory, setHistoryPage, setPageUrl } from 'store/txHistorySlice'

const loadTxHistory = (chainId: string, address: string, pageUrl?: string) => {
  return getTransactionHistory(GATEWAY_URL, chainId, address, pageUrl)
}

const useTxHistory = (): void => {
  const { safe } = useAppSelector(selectSafeInfo)
  const { pageUrl } = useAppSelector(selectTxHistory)
  const dispatch = useAppDispatch()
  const { chainId, txHistoryTag } = safe
  const address = safe.address.value

  // Re-fetch assets when pageUrl, chainId/address, or txHistoryTag change
  const [data, error] = useAsync<TransactionListPage | undefined>(async () => {
    if (chainId && address) {
      return loadTxHistory(chainId, address, pageUrl)
    }
  }, [txHistoryTag, chainId, address, pageUrl])

  // Clear the old TxHistory when Safe address is changed
  useEffect(() => {
    dispatch(setHistoryPage(undefined))
    dispatch(setPageUrl(undefined))
  }, [address, chainId])

  // Save the TxHistory in the store
  useEffect(() => {
    if (data) dispatch(setHistoryPage(data))
  }, [data, dispatch])

  // Log errors
  useEffect(() => {
    if (!error) return
    logError(Errors._602, error.message)
  }, [error])
}

export default useTxHistory
