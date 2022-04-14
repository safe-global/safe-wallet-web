import { useEffect } from 'react'

import { useAppDispatch } from 'store'
import { fetchSafeInfo } from 'store/safeInfoSlice'
import useSafeAddress from 'services/useSafeAddress'
import { POLLING_INTERVAL } from 'config/constants'

// Poll & dispatch the Safe Info into the store
const useSafeInfo = (): void => {
  const { chainId, address } = useSafeAddress()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!chainId || !address) {
      return
    }

    let isCurrent = true
    let timer: NodeJS.Timeout | null = null

    dispatch(fetchSafeInfo({ chainId, address })).finally(() => {
      if (isCurrent) {
        timer = setTimeout(() => {
          dispatch(fetchSafeInfo({ chainId, address }))
        }, POLLING_INTERVAL)
      }
    })

    return () => {
      isCurrent = false
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [chainId, address])
}

export default useSafeInfo
