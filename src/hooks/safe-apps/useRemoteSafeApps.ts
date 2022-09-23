import { useEffect } from 'react'
import { getSafeApps, SafeAppsResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { Errors, logError } from '@/services/exceptions'
import useChainId from '@/hooks/useChainId'
import useAsync, { AsyncResult } from '../useAsync'

const useRemoteSafeApps = (): AsyncResult<SafeAppsResponse> => {
  const chainId = useChainId()

  const [remoteApps, error, loading] = useAsync(async () => {
    if (!chainId) return
    return getSafeApps(chainId, { client_url: window.location.origin })
  }, [chainId])

  useEffect(() => {
    if (error) {
      logError(Errors._902, error.message)
    }
  }, [error])

  return [remoteApps, error, loading]
}

export { useRemoteSafeApps }
