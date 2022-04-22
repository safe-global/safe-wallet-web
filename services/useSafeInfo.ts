import { useCallback, useEffect } from 'react'
import { getSafeInfo, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectSafeInfo, setSafeError, setSafeInfo, setSafeLoading } from '@/store/safeInfoSlice'
import useSafeAddress from './useSafeAddress'
import { POLLING_INTERVAL } from '@/config/constants'
import { Errors, logError } from './exceptions'

// Poll & dispatch the Safe Info into the store
export const useInitSafeInfo = (): void => {
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

  const onLoading = useCallback(
    (loading: boolean, isFirst: boolean) => {
      if (isFirst) {
        dispatch(setSafeLoading(loading))
      }
    },
    [dispatch],
  )

  const onData = useCallback(
    (data: SafeInfo | undefined, isFirst: boolean) => {
      if (data || isFirst) {
        dispatch(setSafeInfo(data))
      }
    },
    [dispatch],
  )

  useEffect(() => {
    let isCurrent = true
    let timer: ReturnType<typeof setTimeout> | undefined

    // Stop polling on unmount
    const onUnmount = () => {
      isCurrent = false
      timer && clearTimeout(timer)
    }

    if (!chainId || !address) return onUnmount

    // Poll the Safe Info
    const loadSafe = async (isFirst = false) => {
      if (!isCurrent) return

      onData(undefined, isFirst)
      onLoading(true, isFirst)

      try {
        const data = await getSafeInfo(chainId, address)
        isCurrent && onData(data, isFirst)
      } catch (err) {
        isCurrent && onError(err as Error, isFirst)
      } finally {
        isCurrent && onLoading(false, isFirst)
      }

      // Set a timer to fetch Safe Info again
      if (isCurrent) {
        timer = setTimeout(() => loadSafe(), POLLING_INTERVAL)
      }
    }

    // Start the loop.
    // We pass true to indicate that this is the first load. Subsequent loads will pass false.
    // This is important to ignore errors on subsequent polling requests.
    loadSafe(true)

    return onUnmount
  }, [chainId, address, onData, onError, onLoading])
}

const useSafeInfo = () => {
  return useAppSelector(selectSafeInfo)
}

export default useSafeInfo
