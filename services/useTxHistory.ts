import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '@/store'
import { fetchTxHistory, selectTxHistory } from '@/store/txHistorySlice'
import useSafeInfo from '@/services/useSafeInfo'

export const useInitTxHistory = (): void => {
  const { safe } = useSafeInfo()
  const dispatch = useAppDispatch()

  const chainId = safe?.chainId
  const address = safe?.address?.value

  // Re-fetch assets when chainId/address, or txHistoryTag change
  useEffect(() => {
    if (!chainId || !address) {
      return
    }
    dispatch(fetchTxHistory({ chainId, address }))
  }, [safe?.txHistoryTag, chainId, address, dispatch])
}

const useTxHistory = () => {
  const txHistory = useAppSelector(selectTxHistory)
  return txHistory
}

export default useTxHistory
