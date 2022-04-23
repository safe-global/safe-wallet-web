import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '@/store'
import useSafeInfo from '@/services/useSafeInfo'
import { fetchBalances, selectBalances } from '@/store/balancesSlice'

export const useInitBalances = (): void => {
  const { safe } = useSafeInfo()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!safe) {
      return
    }
    const promise = dispatch(fetchBalances({ chainId: safe.chainId, address: safe.address.value }))
    return promise.abort
  }, [safe, dispatch])
}

const useBalances = () => {
  const balances = useAppSelector(selectBalances)
  return balances
}

export default useBalances
