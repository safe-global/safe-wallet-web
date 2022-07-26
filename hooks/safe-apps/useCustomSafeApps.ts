import { useState, useEffect, useCallback } from 'react'
import { SafeAppData, SafeAppAccessPolicyTypes } from '@gnosis.pm/safe-react-gateway-sdk'
import local from '@/services/local-storage/local'
import { AppManifest, fetchAppManifest, isAppManifestValid } from '@/services/safe-apps/manifest'

type ReturnType = {
  customSafeApps: SafeAppData[]
  loaded: boolean
  updateCustomSafeApps: (newCustomSafeApps: SafeApp[]) => void
}

const CUSTOM_SAFE_APPS_STORAGE_KEY = 'customSafeApps'

type StoredCustomSafeApp = { url: string }

const fetchSafeAppFromManifest = async (appUrl: string): Promise<SafeAppData> => {
  const appManifest = await fetchAppManifest(appUrl)

  if (!isAppManifestValid(appManifest)) {
    throw new Error('Invalid app manifest')
  }
  const

  return {
    id: Math.random(),
    url: appUrl,
    name: appManifest.name,
    description: appManifest.description,
    accessControl: { type: SafeAppAccessPolicyTypes.NoRestrictions },
    tags: [],
  }
}

/*
  This hook is used to manage the list of custom safe apps.
  What it does:
  1. Loads a list of custom safe apps from local storage
  2. Does some backward compatibility checks (supported app networks, etc)
  3. Tries to fetch the app info (manifest.json) from the app url
*/
const useCustomSafeApps = (): ReturnType => {
  const [customSafeApps, setCustomSafeApps] = useState<SafeAppData[]>([])
  const [loaded, setLoaded] = useState(false)

  const updateCustomSafeApps = useCallback((newCustomSafeApps: SafeAppData[]) => {
    setCustomSafeApps(newCustomSafeApps)

    local.setItem(
      CUSTOM_SAFE_APPS_STORAGE_KEY,
      newCustomSafeApps.map((app) => ({ url: app.url })),
    )
  }, [])

  useEffect(() => {
    const loadCustomApps = async () => {
      const storedApps = local.getItem<StoredCustomSafeApp[]>(CUSTOM_SAFE_APPS_STORAGE_KEY) || []
      const appManifests = await Promise.allSettled(storedApps.map((app) => fetchAppManifest(app.url)))
      const resolvedApps = appManifests
        .filter((promiseResult) => promiseResult.status === 'fulfilled' && isAppManifestValid(promiseResult.value))
        .map((promiseResult) => (promiseResult as PromiseFulfilledResult<AppManifest>).value)

      setCustomSafeApps(serializedApps)
      setLoaded(true)
    }

    loadCustomApps()
  }, [])

  return { customSafeApps, loaded, updateCustomSafeApps }
}

export { useCustomSafeApps }
