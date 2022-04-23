import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '@/store'
import { fetchTxQueue, selectTxQueue } from '@/store/txQueueSlice'
import useSafeInfo from '@/services/useSafeInfo'

export const useInitTxQueue = (): void => {
  const { safe } = useSafeInfo()
  const dispatch = useAppDispatch()

  const chainId = safe?.chainId
  const address = safe?.address?.value

  // Re-fetch assets when pageUrl, chainId/address, or txQueueTag change
  useEffect(() => {
    if (!chainId || !address) {
      return
    }

    const promise = dispatch(fetchTxQueue({ chainId, address }))
    return promise.abort
  }, [safe?.txQueuedTag, chainId, address])
}

const useTxQueue = () => {
  const txQueue = useAppSelector(selectTxQueue)
  return txQueue
}

export default useTxQueue
