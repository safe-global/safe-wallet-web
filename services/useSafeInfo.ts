import { useCallback, useEffect, useState } from 'react'
import { getSafeInfo, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppDispatch } from 'store'
import { setSafeInfo } from 'store/safeInfoSlice'
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
): [data: T | undefined, error: Error | undefined, loading: boolean] => {
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

  return [data, error, loading]
}

// Fetch Safe Info every N seconds
const usePolledSafeInfo = (
  chainId: string,
  address: string,
): [safeInfo: SafeInfo | undefined, error: Error | undefined, loading: boolean] => {
  // Memoized function that loads safe info
  const loadSafeInfo = useCallback(() => {
    if (!chainId || !address) {
      return Promise.resolve(undefined)
    }
    return fetchSafeInfo(chainId, address)
  }, [address, chainId])

  // Poll safe info
  return usePolling<SafeInfo | undefined>(loadSafeInfo, POLLING_INTERVAL)
}

// Dispatch the Safe Info into the store
const useSafeInfo = (): { loading: boolean; error?: Error } => {
  const { address, chainId } = useSafeAddress()
  const [safeInfo, error, loading] = usePolledSafeInfo(chainId, address)
  const dispatch = useAppDispatch()

  // Update the store when safe info is changed
  useEffect(() => {
    if (!safeInfo || !address || !chainId) return

    // Check that the data is still relevant
    if (safeInfo.chainId !== chainId || safeInfo.address.value !== address) return

    dispatch(setSafeInfo(safeInfo))
  }, [dispatch, safeInfo, address, chainId])

  // Log on error
  useEffect(() => {
    if (error) logError(Errors._605, error.message)
  }, [error])

  return { loading, error }
}

export default useSafeInfo
