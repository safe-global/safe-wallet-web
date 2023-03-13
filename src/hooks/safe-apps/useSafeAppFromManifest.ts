import { useEffect, useMemo } from 'react'
import { Errors, logError } from '@/services/exceptions'
import { fetchSafeAppFromManifest } from '@/services/safe-apps/manifest'
import useAsync from '@/hooks/useAsync'
import { getEmptySafeApp } from '@/components/safe-apps/utils'
import type { SafeAppDataWithPermissions } from '@/components/safe-apps/types'

type UseSafeAppFromManifestReturnType = {
  safeApp: SafeAppDataWithPermissions
  isLoading: boolean
}

const useSafeAppFromManifest = (appUrl: string, chainId: string): UseSafeAppFromManifestReturnType => {
  const [data, error, isLoading] = useAsync<SafeAppDataWithPermissions>(() => {
    if (appUrl && chainId) return fetchSafeAppFromManifest(appUrl, chainId)
  }, [appUrl, chainId])

  const emptyApp = useMemo(() => getEmptySafeApp(appUrl), [appUrl])

  useEffect(() => {
    if (!error) return
    logError(Errors._903, `${appUrl}, ${(error as Error).message}`)
  }, [appUrl, error])

  return { safeApp: data || emptyApp, isLoading }
}

export { useSafeAppFromManifest }
