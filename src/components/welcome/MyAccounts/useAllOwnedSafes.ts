import type { AllOwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'
import { getAllOwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'
import type { AsyncResult } from '@/hooks/useAsync'
import useAsync from '@/hooks/useAsync'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { useEffect } from 'react'

const CACHE_KEY = 'ownedSafesCache_'

type OwnedSafesPerAddress = {
  address: string | undefined
  ownedSafes: AllOwnedSafes
}

const useAllOwnedSafes = (address: string): AsyncResult<AllOwnedSafes> => {
  const [cache, setCache] = useLocalStorage<AllOwnedSafes>(CACHE_KEY + address)

  const [data, error, isLoading] = useAsync<OwnedSafesPerAddress>(async () => {
    if (!address)
      return {
        ownedSafes: {},
        address: undefined,
      }
    const ownedSafes = await getAllOwnedSafes(address)
    return {
      ownedSafes,
      address,
    }
  }, [address])

  useEffect(() => {
    if (data?.ownedSafes != undefined && data.address === address) {
      setCache(data.ownedSafes)
    }
  }, [address, cache, data, setCache])

  return [cache, error, isLoading]
}

export default useAllOwnedSafes
