import { useEffect } from 'react'
import { getSafeApps, SafeAppsResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { Errors, logError } from '@/services/exceptions'
import useAsync, { AsyncResult } from './useAsync'
import useChainId from '@/hooks/useChainId'

const useSafeApps = (): AsyncResult<SafeAppsResponse> => {
  const chainId = useChainId()

  const [apps, error, loading] = useAsync(async () => {
    if (!chainId) return
    return getSafeApps(chainId)
  }, [chainId])

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._900, error.message)
    }
  }, [error])

  return [apps, error, loading]
}

export { useSafeApps }
