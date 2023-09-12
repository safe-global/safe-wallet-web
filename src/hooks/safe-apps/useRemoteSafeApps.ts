import { useEffect, useMemo } from 'react'
import type { SafeAppsResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { getSafeApps } from '@safe-global/safe-gateway-typescript-sdk'
import { Errors, logError } from '@/services/exceptions'
import useChainId from '@/hooks/useChainId'
import type { AsyncResult } from '../useAsync'
import useAsync from '../useAsync'
import type { SafeAppsTag } from '@/config/constants'

// To avoid multiple simultaneous requests (e.g. the Dashboard and the SAFE header widget),
// cache the request promise for 100ms
let cache: Record<string, Promise<SafeAppsResponse> | undefined> = {}
const cachedGetSafeApps = (chainId: string): ReturnType<typeof getSafeApps> | undefined => {
  if (!cache[chainId]) {
    cache[chainId] = getSafeApps(chainId, { client_url: window.location.origin })

    // Clear the cache the promise resolves with a small delay
    cache[chainId]
      ?.catch(() => null)
      .then(() => {
        setTimeout(() => (cache[chainId] = undefined), 100)
      })
  }

  return cache[chainId]
}

const useRemoteSafeApps = (tag?: SafeAppsTag): AsyncResult<SafeAppsResponse> => {
  const chainId = useChainId()

  const [remoteApps, error, loading] = useAsync<SafeAppsResponse>(() => {
    if (!chainId) return
    return cachedGetSafeApps(chainId)
  }, [chainId])

  useEffect(() => {
    if (error) {
      logError(Errors._902, error.message)
    }
  }, [error])

  const apps = useMemo(() => {
    if (!remoteApps || !tag) return remoteApps
    return remoteApps.filter((app) => app.tags.includes(tag))
  }, [remoteApps, tag])

  const sortedApps = useMemo(() => {
    return apps?.sort((a, b) => a.name.localeCompare(b.name))
  }, [apps])

  return [sortedApps, error, loading]
}

export { useRemoteSafeApps }
