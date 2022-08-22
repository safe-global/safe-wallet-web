import { useEffect } from 'react'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { Errors, logError } from '@/services/exceptions'
import { fetchSafeAppFromManifest } from '@/services/safe-apps/manifest'
import useAsync from '../useAsync'

type UseSafeAppFromManifestReturnType = {
  safeApp?: SafeAppData
  isLoading: boolean
}

const useSafeAppFromManifest = (appUrl: string, chainId: string): UseSafeAppFromManifestReturnType => {
  const [data, error, loading] = useAsync<SafeAppData>(() => {
    if (appUrl && chainId) return fetchSafeAppFromManifest(appUrl, chainId)
  }, [appUrl, chainId])

  useEffect(() => {
    if (!error) return
    logError(Errors._900, `${appUrl}, ${(error as Error).message}`)
  }, [appUrl, error])

  return { safeApp: data, isLoading: loading }
}

export { useSafeAppFromManifest }
