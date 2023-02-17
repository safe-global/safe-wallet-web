import { useAppSelector } from '@/store'
import { selectPendingTxs } from '@/store/pendingTxsSlice'
import { useMemo } from 'react'
import useChainId from './useChainId'

const useHasPendingTxs = () => {
  const chainId = useChainId()
  const pendingTxs = useAppSelector(selectPendingTxs)

  return useMemo(() => {
    return Object.values(pendingTxs).some((tx) => tx.chainId === chainId)
  }, [chainId, pendingTxs])
}

export default useHasPendingTxs
