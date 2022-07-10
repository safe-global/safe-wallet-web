import { useAppDispatch } from '@/store'
import { setLastChainId, setLastSafeAddress } from '@/store/sessionSlice'
import { useEffect } from 'react'
import useChainId from './useChainId'
import useSafeInfo from './useSafeInfo'

export const useInitSession = (): void => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()
  const { safe } = useSafeInfo()
  // N.B. only successfully loaded Safes, don't use useSafeAddress() here!
  const safeAddress = safe?.address.value

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
