import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '@/store'
import { fetchSafeInfo, selectSafeInfo } from '@/store/safeInfoSlice'
import useSafeAddress from '@/services/useSafeAddress'
import { POLLING_INTERVAL } from '@/config/constants'

// Poll & dispatch the Safe Info into the store
export const useInitSafeInfo = (): void => {
  const { address, chainId } = useSafeAddress()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!chainId || !address) {
      return
    }

    let isCurrent = true
    let timer: NodeJS.Timeout | undefined

    let promise = dispatch(fetchSafeInfo({ chainId, address }))

    promise.finally(() => {
      if (isCurrent) {
        timer = setTimeout(() => {
          promise = dispatch(fetchSafeInfo({ chainId, address }))
        }, POLLING_INTERVAL)
      }
    })

    return () => {
      isCurrent = false
      promise.abort()
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [chainId, address, dispatch])
}

const useSafeInfo = () => {
  return useAppSelector(selectSafeInfo)
}

export default useSafeInfo
