import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '@/store'
import useSafeInfo from '@/services/useSafeInfo'
import { fetchCollectibles, selectCollectibles } from '@/store/collectiblesSlice'

export const useInitCollectibles = (): void => {
  const { safe } = useSafeInfo()
  const dispatch = useAppDispatch()

  const chainId = safe?.chainId
  const address = safe?.address.value

  useEffect(() => {
    if (!chainId || !address) {
      return
    }
    dispatch(fetchCollectibles({ chainId, address }))
  }, [dispatch, chainId, address, safe?.collectiblesTag])
}

const useCollectibles = () => {
  return useAppSelector(selectCollectibles)
}

export default useCollectibles
