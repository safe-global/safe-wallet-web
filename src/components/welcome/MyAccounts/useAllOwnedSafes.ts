import type { AllOwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'
import { getAllOwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'
import type { AsyncResult } from '@/hooks/useAsync'
import useAsync from '@/hooks/useAsync'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { useEffect } from 'react'

const CACHE_KEY = 'ownedSafesCache_'

const useAllOwnedSafes = (address: string): AsyncResult<AllOwnedSafes> => {
  const [cache, setCache] = useLocalStorage<AllOwnedSafes>(CACHE_KEY + address)

  const [data, error, isLoading] = useAsync<AllOwnedSafes>(() => {
    if (!address) return
    return getAllOwnedSafes(address)
  }, [address])

  useEffect(() => {
    if (data != null) setCache(data)
  }, [data, setCache])

  return [data ?? cache, error, isLoading]
}

export default useAllOwnedSafes
