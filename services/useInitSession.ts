import { useAppDispatch } from '@/store'
import { setLastChainId, setLastSafeAddress } from '@/store/sessionSlice'
import { useEffect } from 'react'
import useChainId from './useChainId'
import useSafeAddress from './useSafeAddress'

export const useInitSession = (): void => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()
  const safeAddress = useSafeAddress()

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
