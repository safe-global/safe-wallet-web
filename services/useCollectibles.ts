import { getCollectibles, SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { GATEWAY_URL } from '@/config/constants'
import useAsync from './useAsync'
import useSafeInfo from './useSafeInfo'
import { Errors, logError } from './exceptions'
import { selectCollectibles, setCollectibles } from '@/store/collectiblesSlice'

const loadCollectibles = (chainId: string, address: string) => {
  return getCollectibles(GATEWAY_URL, chainId, address)
}

export const useInitCollectibles = (): void => {
  const { safe } = useSafeInfo()
  const { chainId, collectiblesTag, address } = safe
  const dispatch = useAppDispatch()

  // Re-fetch assets when the entire SafeInfo updates
  const [data, error] = useAsync<SafeCollectibleResponse[] | undefined>(async () => {
    if (!address.value) return

    return loadCollectibles(chainId, address.value)
  }, [address.value, chainId, collectiblesTag])

  // Clear the old Collectibles when Safe address is changed
  useEffect(() => {
    dispatch(setCollectibles(undefined))
  }, [safe.address.value, safe.chainId])

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
