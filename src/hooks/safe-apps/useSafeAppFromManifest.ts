import { useEffect, useMemo } from 'react'
import { SafeAppAccessPolicyTypes, SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { Errors, logError } from '@/services/exceptions'
import { fetchSafeAppFromManifest } from '@/services/safe-apps/manifest'
import useAsync from '../useAsync'

type UseSafeAppFromManifestReturnType = {
  safeApp?: SafeAppData
  isLoading: boolean
}

const UNKNOWN_APP_NAME = 'unknown'
const UNKNOWN_APP_LOGO = '/images/apps-icon.svg'

const useSafeAppFromManifest = (appUrl: string, chainId: string): UseSafeAppFromManifestReturnType => {
  const [data, error, loading] = useAsync<SafeAppData>(() => {
    if (appUrl && chainId) return fetchSafeAppFromManifest(appUrl, chainId)
  }, [appUrl, chainId])

  const emptyApp = useMemo(() => getEmptySafeApp(appUrl), [appUrl])

  useEffect(() => {
    if (!error) return
    logError(Errors._900, `${appUrl}, ${(error as Error).message}`)
  }, [appUrl, error])

  return { safeApp: data || emptyApp, isLoading: loading }
}

const getEmptySafeApp = (url = ''): SafeAppData => {
  return {
    id: Math.random(),
    url,
    name: UNKNOWN_APP_NAME,
    iconUrl: UNKNOWN_APP_LOGO,
    description: '',
    chainIds: [],
    accessControl: {
      type: SafeAppAccessPolicyTypes.NoRestrictions,
    },
    tags: [],
  }
}

export { useSafeAppFromManifest }
