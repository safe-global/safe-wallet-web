import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '@/store'
import { fetchTxHistory, selectTxHistory } from '@/store/txHistorySlice'
import useSafeInfo from '@/services/useSafeInfo'

export const useInitTxHistory = (): void => {
  const { safe } = useSafeInfo()
  const dispatch = useAppDispatch()

  const chainId = safe?.chainId
  const address = safe?.address?.value

  // Re-fetch assets when pageUrl, chainId/address, or txHistoryTag change
  useEffect(() => {
    if (!chainId || !address) {
      return
    }

    let isCurrent = true

    if (isCurrent) {
      dispatch(fetchTxHistory({ chainId, address }))
    }

    return () => {
      isCurrent = false
    }
  }, [safe?.txHistoryTag, chainId, address, dispatch])
}

const useTxHistory = () => {
  const txHistory = useAppSelector(selectTxHistory)
  return txHistory
}

export default useTxHistory
