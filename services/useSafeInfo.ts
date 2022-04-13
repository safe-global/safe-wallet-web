import { useCallback, useEffect, useState } from 'react'
import { getSafeInfo, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppDispatch } from 'store'
import { setSafeInfo } from 'store/safeInfoSlice'
import useSafeAddress from './useSafeAddress'
import { GATEWAY_URL, POLLING_INTERVAL } from 'config/constants'
import useAsync from './useAsync'
import { Errors, logError } from './exceptions/CodedException'

const fetchSafeInfo = (chainId: string, address: string): Promise<SafeInfo> => {
  return getSafeInfo(GATEWAY_URL, chainId, address)
}

// Fetch Safe Info every N seconds
const usePolledSafeInfo = (
  chainId: string,
  address: string,
): { safeInfo?: SafeInfo; loading: boolean; error?: Error } => {
  const [fetchCount, setFetchCount] = useState<number>(0)

  // Memoized function that loads safe info
  const loadSafeInfo = useCallback(() => {
    if (!chainId || !address) {
      return Promise.resolve(undefined)
    }
    return fetchSafeInfo(chainId, address)
  }, [address, chainId, fetchCount])

  // Load safe info
  const [data, error, loading] = useAsync<SafeInfo | undefined>(loadSafeInfo)

  // Set a timer to re-fetch safe info after when data or error updates
  useEffect(() => {
    if (!data && !error) return

    // Update the count so that loadSafeInfo is updated and called again
    const timer = setTimeout(() => {
      setFetchCount((prev: number) => prev + 1)
    }, POLLING_INTERVAL)

    // If the component is unmounted, the next poll won't happen
    return () => {
      clearTimeout(timer)
    }
  }, [data, error, setFetchCount])

  return { safeInfo: data, loading, error }
}

// Dispatch the Safe Info into the store
const useSafeInfo = (): { loading: boolean; error?: Error } => {
  const { address, chainId } = useSafeAddress()
  const { safeInfo, error, loading } = usePolledSafeInfo(chainId, address)
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
