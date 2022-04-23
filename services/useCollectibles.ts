import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '@/store'
import useSafeInfo from '@/services/useSafeInfo'
import { fetchCollectibles, selectCollectibles } from '@/store/collectiblesSlice'

export const useInitCollectibles = (): void => {
  const { safe } = useSafeInfo()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!safe) {
      return
    }
    const promise = dispatch(fetchCollectibles({ chainId: safe.chainId, address: safe.address.value }))
    return promise.abort
  }, [safe, dispatch])
}

const useCollectibles = () => {
  return useAppSelector(selectCollectibles)
}

export default useCollectibles
