import { getCollectibles, SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import useAsync from './useAsync'
import useSafeInfo from './useSafeInfo'
import { Errors, logError } from './exceptions'
import { selectCollectibles, setCollectibles } from '@/store/collectiblesSlice'

export const useInitCollectibles = (): void => {
  const { safe } = useSafeInfo()
  const { chainId, collectiblesTag, address } = safe
  const dispatch = useAppDispatch()

  // Re-fetch assets when the Safe address or the collectibes tag updates
  const [data, error] = useAsync<SafeCollectibleResponse[] | undefined>(async () => {
    if (!address.value) return

    return getCollectibles(chainId, address.value)
  }, [address.value, chainId, collectiblesTag])

  // Clear the old Collectibles when Safe address is changed
  useEffect(() => {
    dispatch(setCollectibles(undefined))
  }, [safe.address.value, safe.chainId, dispatch])

  // Save the Collectibles in the store
  useEffect(() => {
    if (data) dispatch(setCollectibles(data))
  }, [data, dispatch])

  // Log errors
  useEffect(() => {
    if (!error) return
    logError(Errors._604, error.message)
  }, [error])
}

const useCollectibles = () => {
  return useAppSelector(selectCollectibles)
}

export default useCollectibles
