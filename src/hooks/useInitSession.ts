import { useAppDispatch } from '@/store'
import { setLastChainId, setLastSafeAddress } from '@/store/sessionSlice'
import { useEffect } from 'react'
import { useUrlChainId } from './useChainId'
import useSafeInfo from './useSafeInfo'

export const useInitSession = (): void => {
  const dispatch = useAppDispatch()
  const chainId = useUrlChainId()
  // N.B. only successfully loaded Safes, don't use useSafeAddress() here!
  const { safe, safeAddress } = useSafeInfo()

  useEffect(() => {
    if (chainId) {
      dispatch(setLastChainId(chainId))
    }
  }, [dispatch, chainId])

  useEffect(() => {
    if (!safeAddress) return

    dispatch(
      setLastSafeAddress({
        // This chainId isn't necessarily the same as the current chainId
        chainId: safe.chainId,
        safeAddress,
      }),
    )
  }, [dispatch, safe.chainId, safeAddress])
}
