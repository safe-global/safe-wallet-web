import { getTransactionHistory, TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'store'
import { selectSafeInfo } from 'store/safeInfoSlice'
import { GATEWAY_URL } from 'config/constants'
import useAsync from './useAsync'
import { Errors, logError } from './exceptions/CodedException'
import { setTxHistory } from 'store/txHistorySlice'

const loadTxHistory = (chainId: string, address: string) => {
  return getTransactionHistory(GATEWAY_URL, chainId, address)
}

const useTxHistory = (): void => {
  const { safe } = useAppSelector(selectSafeInfo)
  const dispatch = useAppDispatch()

  // Re-fetch assets when address, chainId, or txHistoryTag change
  const [data, error] = useAsync<TransactionListPage | undefined>(async () => {
    if (!safe.address.value) return
    return loadTxHistory(safe.chainId, safe.address.value)
  }, [safe.txHistoryTag, safe.chainId, safe.address.value])

  // Clear the old TxHistory when Safe address is changed
  useEffect(() => {
    dispatch(setTxHistory(undefined))
  }, [safe.address.value, safe.chainId])

  // Save the TxHistory in the store
  useEffect(() => {
    if (data) dispatch(setTxHistory(data))
  }, [data, dispatch])

  // Log errors
  useEffect(() => {
    if (!error) return
    logError(Errors._602, error.message)
  }, [error])
}

export default useTxHistory
