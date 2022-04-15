import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'store'
import { selectSafeInfo } from 'store/safeInfoSlice'
import { fetchBalances } from 'store/balancesSlice'

const useBalances = (): void => {
  const { safe } = useAppSelector(selectSafeInfo)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const { chainId } = safe
    const address = safe.address.value

    if (chainId && address) {
      dispatch(fetchBalances({ chainId, address }))
    }
  }, [dispatch, safe])
}

export default useBalances
