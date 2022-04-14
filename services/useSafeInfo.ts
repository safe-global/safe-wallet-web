import { useCallback, useEffect, useState } from 'react'
import { getSafeInfo, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppDispatch } from 'store'
import { setSafeError, setSafeInfo, setSafeLoading } from 'store/safeInfoSlice'
import useSafeAddress from './useSafeAddress'
import { GATEWAY_URL, POLLING_INTERVAL } from 'config/constants'
import { Errors, logError } from './exceptions/CodedException'
import useAsync from './useAsync'

const fetchSafeInfo = (chainId: string, address: string): Promise<SafeInfo> => {
  return getSafeInfo(GATEWAY_URL, chainId, address)
}

const usePolling = <T>(
  callback: () => Promise<T>,
  interval: number,
): [data: T | undefined, error: Error | undefined, loading: boolean, count: number] => {
  const [count, setCount] = useState<number>(0)

  const [data, error, loading] = useAsync<T>(callback, [count, callback])

  useEffect(() => {
    if (!data && !error) return

    const timer = setTimeout(() => {
      setCount((prev: number) => prev + 1)
    }, interval)

    return () => {
      clearTimeout(timer)
    }
  }, [data, error, setCount, interval])

  return [data, error, loading, count]
}

// Fetch Safe Info every N seconds
const usePolledSafeInfo = (
  chainId: string,
  address: string,
): [safeInfo: SafeInfo | undefined, error: Error | undefined, loading: boolean] => {
  // Memoized function that loads safe info
  const loadSafeInfo = useCallback(async () => {
    if (chainId && address) {
      return fetchSafeInfo(chainId, address)
    }
  }, [address, chainId])

  // Poll safe info
  const [data, error, loading, count] = usePolling<SafeInfo | undefined>(loadSafeInfo, POLLING_INTERVAL)

  return [
    data,
    // Pass error and loading state only when polling for the first time
    count === 0 ? error : undefined,
    count === 0 ? loading : false,
  ]
}

// Dispatch the Safe Info into the store
const useSafeInfo = (): void => {
  const { address, chainId } = useSafeAddress()
  const [safeInfo, error, loading] = usePolledSafeInfo(chainId, address)
  const dispatch = useAppDispatch()

  // Set loading state
  useEffect(() => {
    dispatch(setSafeLoading(loading))
  }, [loading])

  // Update the store when safe info is changed
  useEffect(() => {
    if (!safeInfo || !address || !chainId) return

    // Check that the data is still relevant
    if (safeInfo.chainId !== chainId || safeInfo.address.value !== address) return

    dispatch(setSafeInfo(safeInfo))
  }, [dispatch, safeInfo, address, chainId])

  // Log on error
  useEffect(() => {
    if (!error) return
    logError(Errors._605, error.message)

    dispatch(setSafeError(error))
  }, [error])
}

export default useSafeInfo
