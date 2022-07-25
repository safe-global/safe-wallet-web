import { useAppDispatch } from '@/store'
import { setLastChainId, setLastSafeAddress } from '@/store/sessionSlice'
import { useEffect } from 'react'
import useChainId from './useChainId'
import useSafeInfo from './useSafeInfo'

export const useInitSession = (): void => {
  const dispatch = useAppDispatch()
  // N.B. use "useChainId" because we can be on a non-Safe route
  const chainId = useChainId()
  // N.B. only successfully loaded Safes, don't use useSafeAddress() here!
  const { safeAddress } = useSafeInfo()

  useEffect(() => {
    dispatch(setLastChainId(chainId))
  }, [dispatch, chainId])

  useEffect(() => {
    if (!safeAddress) return

    dispatch(
      setLastSafeAddress({
        chainId,
        safeAddress,
      }),
    )
  }, [dispatch, chainId, safeAddress])
}
