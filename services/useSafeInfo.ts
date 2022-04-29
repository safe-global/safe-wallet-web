import { useCallback, useEffect } from 'react'
import { getSafeInfo, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectSafeInfo, setSafeInfo } from '@/store/safeInfoSlice'
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
        dispatch(setSafeInfo({ error, loading: false }))
      }
    },
    [dispatch],
  )

  const onLoading = useCallback(
    (isFirst: boolean) => {
      if (isFirst) {
        dispatch(setSafeInfo({ loading: true }))
      }
    },
    [dispatch],
  )

  const onData = useCallback(
    (data: SafeInfo | undefined, isFirst: boolean) => {
      if (data || isFirst) {
        dispatch(setSafeInfo({ safe: data, loading: false }))
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

    if (!chainId || !address) {
      onData(undefined, true)
      return onUnmount
    }

    // Poll the Safe Info
    const loadSafe = async (isFirst = false) => {
      if (!isCurrent) return

      onLoading(isFirst)

      try {
        const data = await getSafeInfo(chainId, address)
        isCurrent && onData(data, isFirst)
      } catch (err) {
        isCurrent && onError(err as Error, isFirst)
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
