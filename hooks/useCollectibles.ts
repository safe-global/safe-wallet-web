import { getCollectibles, SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import useAsync from './useAsync'
import useSafeInfo from './useSafeInfo'
import { Errors, logError } from '@/services/exceptions'
import { selectCollectibles, collectiblesSlice } from '@/store/collectiblesSlice'

export const useInitCollectibles = (): void => {
  const { safe } = useSafeInfo()
  const { chainId, collectiblesTag } = safe || {}
  const address = safe?.address.value
  const dispatch = useAppDispatch()

  // Re-fetch assets when the Safe address or the collectibes tag updates
  const [data, error] = useAsync<SafeCollectibleResponse[] | undefined>(async () => {
    if (!address || !chainId) return
    return getCollectibles(chainId, address)
  }, [address, chainId, collectiblesTag])

  // Clear the old Collectibles when Safe address is changed
  useEffect(() => {
    if (!safe) {
      dispatch(collectiblesSlice.actions.set({ data: [], loading: true }))
    }
  }, [dispatch, safe])

  // Save the Collectibles in the store
  useEffect(() => {
    if (data || error) {
      dispatch(collectiblesSlice.actions.set({ data: data || [], error, loading: false }))
    }
  }, [dispatch, data, error])

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._604, error.message)
    }
  }, [error])
}

const useCollectibles = () => {
  return useAppSelector(selectCollectibles)
}

export default useCollectibles
