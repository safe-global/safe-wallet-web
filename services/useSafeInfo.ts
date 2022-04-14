import { useCallback, useEffect } from 'react'
import { getSafeInfo, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppDispatch } from 'store'
import { setSafeError, setSafeInfo, setSafeLoading } from 'store/safeInfoSlice'
import useSafeAddress from './useSafeAddress'
import { GATEWAY_URL, POLLING_INTERVAL } from 'config/constants'
import { Errors, logError } from './exceptions/CodedException'

const fetchSafeInfo = (chainId: string, address: string): Promise<SafeInfo> => {
  return getSafeInfo(GATEWAY_URL, chainId, address)
}

// Poll & dispatch the Safe Info into the store
const useSafeInfo = (): void => {
  const { address, chainId } = useSafeAddress()
  const dispatch = useAppDispatch()

  const onError = useCallback(
    (error: Error, isFirst: boolean) => {
      logError(Errors._605, error.message)

      // Pass the error to the store only on first request
      if (isFirst) {
        dispatch(setSafeError(error))
      }
    },
    [dispatch],
  )

  const onData = useCallback(
    (data: SafeInfo, isFirst: boolean) => {
      if (data || isFirst) {
        dispatch(setSafeInfo(data))
      }
    },
    [dispatch],
  )

  const onLoading = useCallback(
    (loading: boolean, isFirst: boolean) => {
      if (isFirst) {
        dispatch(setSafeLoading(loading))
      }
    },
    [dispatch],
  )

  useEffect(() => {
    if (!chainId || !address) return

    let isCurrent = true
    let timer: NodeJS.Timeout | null = null

    const loadSafe = (isFirst = false) => {
      onLoading(true, isFirst)

      fetchSafeInfo(chainId, address)
        .then((data) => isCurrent && onData(data, isFirst))
        .catch((err) => isCurrent && onError(err, isFirst))
        .finally(() => {
          if (isCurrent) {
            onLoading(false, isFirst)

            // Set a timer to fetch Safe Info again
            timer = setTimeout(() => loadSafe(), POLLING_INTERVAL)
          }
        })
    }

    // First load
    loadSafe(true)

    return () => {
      isCurrent = false
      timer && clearTimeout(timer)
    }
  }, [chainId, address])
}

export default useSafeInfo
