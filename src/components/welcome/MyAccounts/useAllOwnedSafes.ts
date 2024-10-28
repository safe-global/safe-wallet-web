import type { AllOwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'
import type { AsyncResult } from '@/hooks/useAsync'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { useEffect } from 'react'
import { useGetAllOwnedSafesQuery } from '@/store/api/gateway'
import { asError } from '@/services/exceptions/utils'
import { skipToken } from '@reduxjs/toolkit/query'

const CACHE_KEY = 'ownedSafesCache_'

const useAllOwnedSafes = (address: string): AsyncResult<AllOwnedSafes> => {
  const [cache, setCache] = useLocalStorage<AllOwnedSafes>(CACHE_KEY + address)

  const { data, error, isLoading } = useGetAllOwnedSafesQuery(address === '' ? skipToken : { walletAddress: address })

  useEffect(() => {
    if (data != undefined) {
      setCache(data)
    }
  }, [address, cache, data, setCache])

  return [cache, asError(error), isLoading]
}

export default useAllOwnedSafes
