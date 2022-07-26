import { useState, useEffect, useCallback } from 'react'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { logError, Errors } from 'src/logic/exceptions/CodedException'
import { FETCH_STATUS } from 'src/utils/requests'
import { getAppInfoFromUrl, getEmptySafeApp } from '../../utils'
import local from '@/services/local-storage/local'

type ReturnType = {
  customSafeApps: SafeApp[]
  loaded: boolean
  updateCustomSafeApps: (newCustomSafeApps: SafeApp[]) => void
}

const CUSTOM_SAFE_APPS_STORAGE_KEY = 'customSafeApps'

type StoredCustomSafeApp = { url: string }

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

  const updateCustomSafeApps = useCallback((newCustomSafeApps: SafeApp[]) => {
    setCustomSafeApps(newCustomSafeApps)
    local
  }, [])

  useEffect(() => {
    const fetchAppCallback = (res: SafeApp, error = false) => {
      setCustomSafeApps((prev) => {
        const prevAppsCopy = [...prev]
        const appIndex = prevAppsCopy.findIndex((a) => a.url === res.url)

        if (error) {
          prevAppsCopy.splice(appIndex, 1)
        } else {
          prevAppsCopy[appIndex] = { ...res, fetchStatus: FETCH_STATUS.SUCCESS }
        }

        return prevAppsCopy
      })
    }

    const loadCustomApps = () => {
      // recover apps from storage (third-party apps added by the user)
      const storageAppList = loadFromStorage<CustomSafeApp[]>(APPS_STORAGE_KEY) || []
      // if the app does not expose supported networks, include them. (backward compatible)
      const serializedApps = storageAppList.map(
        (app): SafeApp => ({
          ...getEmptySafeApp(),
          ...app,
          url: app.url.trim(),
          id: app.url.trim(),
          custom: true,
        }),
      )
      setCustomSafeApps(serializedApps)
      setLoaded(true)

      serializedApps.forEach((app) => {
        getAppInfoFromUrl(app.url)
          .then((appFromUrl) => {
            fetchAppCallback({ ...appFromUrl, custom: true })
          })
          .catch((err) => {
            fetchAppCallback(app, true)
            logError(Errors._900, `${app.url}, ${err.message}`)
          })
      })
    }

    loadCustomApps()
  }, [])

  return { customSafeApps, loaded, updateCustomSafeApps }
}

export { useCustomSafeApps }
