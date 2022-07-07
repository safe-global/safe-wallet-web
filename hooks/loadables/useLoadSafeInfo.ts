import { useEffect } from 'react'
import { getSafeInfo, type SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import useAsync, { type AsyncResult } from '../useAsync'
import useSafeAddress from '../useSafeAddress'
import { useChainId } from '../useChainId'
import useIntervalCounter from '../useIntervalCounter'
import useSafeInfo from '../useSafeInfo'
import { Errors, logError } from '@/services/exceptions'
import { POLLING_INTERVAL } from '@/config/constants'

export const useLoadSafeInfo = (): AsyncResult<SafeInfo> => {
  const address = useSafeAddress()
  const chainId = useChainId()
  const [counter, resetCounter] = useIntervalCounter(POLLING_INTERVAL)
  const { safe } = useSafeInfo()
  const isStoredSafeValid = safe?.address.value === address

  const [data, error, loading] = useAsync<SafeInfo | undefined>(async () => {
    if (!chainId || !address) return
    return await getSafeInfo(chainId, address)
  }, [chainId, address, counter])

  // Reset the counter when safe address/chainId changes
  useEffect(() => {
    resetCounter()
  }, [resetCounter, address, chainId])

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._601, error.message)
    }
  }, [error])

  return [
    // Return stored SafeInfo between polls
    data ?? (isStoredSafeValid ? safe : data),
    error,
    loading,
  ]
}

export default useLoadSafeInfo
