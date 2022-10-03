import { useEffect } from 'react'
import type { SafeAppsResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { getSafeApps } from '@gnosis.pm/safe-react-gateway-sdk'
import { Errors, logError } from '@/services/exceptions'
import useChainId from '@/hooks/useChainId'
import type { AsyncResult } from '../useAsync'
import useAsync from '../useAsync'

// To avoid multiple simultaneous requests (e.g. the Dashboard and the SAFE header widget),
// cache the request promise for 100ms
let cache: Promise<SafeAppsResponse> | undefined
const cachedGetSafeApps = (chainId: string): ReturnType<typeof getSafeApps> => {
  if (!cache) {
    cache = getSafeApps(chainId, { client_url: window.location.origin })

    // Clear the cache the promise resolves with a small delay
    cache.finally(() => {
      setTimeout(() => (cache = undefined), 100)
    })
  }
  return cache
}

const useRemoteSafeApps = (): AsyncResult<SafeAppsResponse> => {
  const chainId = useChainId()

  const [remoteApps, error, loading] = useAsync(async () => {
    if (!chainId) return
    return cachedGetSafeApps(chainId)
  }, [chainId])

  useEffect(() => {
    if (error) {
      logError(Errors._902, error.message)
    }
  }, [error])

  return [remoteApps, error, loading]
}

export { useRemoteSafeApps }
