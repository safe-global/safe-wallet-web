import * as React from 'react'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { useCustomSafeApps } from '@/hooks/safe-apps/useCustomSafeApps'
import { usePinnedSafeApps } from '@/hooks/safe-apps/usePinnedSafeApps'

type ReturnType = {
  allSafeApps: SafeAppData[]
  pinnedSafeApps: SafeAppData[]
  remoteSafeApps: SafeAppData[]
  customSafeApps: SafeAppData[]
  remoteSafeAppsLoading: boolean
  customSafeAppsLoading: boolean
  remoteSafeAppsError?: Error
  addCustomApp: (app: SafeAppData) => void
  togglePin: (appId: number) => void
}

const useDeadPinnedSafeAppsRemover = (
  remoteSafeApps: SafeAppData[],
  pinnedSafeAppIds: string[],
  updateCallback: (newIds: string[]) => void,
) => {
  React.useEffect(() => {
    if (remoteSafeApps.length > 0 && pinnedSafeAppIds.length > 0) {
      const filteredPinnedAppsIds = pinnedSafeAppIds.filter((pinnedAppId) =>
        remoteSafeApps.some((app) => app.id === +pinnedAppId),
      )
      if (filteredPinnedAppsIds.length !== pinnedSafeAppIds.length) {
        updateCallback(filteredPinnedAppsIds)
      }
    }
  }, [remoteSafeApps, pinnedSafeAppIds, updateCallback])
}

const useSafeApps = (): ReturnType => {
  const [remoteSafeApps = [], remoteSafeAppsError, remoteSafeAppsLoading] = useRemoteSafeApps()
  const { customSafeApps, loading: customSafeAppsLoading, updateCustomSafeApps } = useCustomSafeApps()
  const { pinnedSafeAppIds, updatePinnedSafeApps } = usePinnedSafeApps()

  useDeadPinnedSafeAppsRemover(remoteSafeApps, pinnedSafeAppIds, updatePinnedSafeApps)

  const allSafeApps = React.useMemo(
    () => remoteSafeApps.concat(customSafeApps).sort((a, b) => a.name.localeCompare(b.name)),
    [remoteSafeApps, customSafeApps],
  )

  const pinnedSafeApps = React.useMemo(
    () => remoteSafeApps.filter((app) => pinnedSafeAppIds.includes(app.id.toString())),
    [remoteSafeApps, pinnedSafeAppIds],
  )

  const addCustomApp = React.useCallback(
    (app: SafeAppData) => {
      updateCustomSafeApps([...customSafeApps, app])
    },
    [updateCustomSafeApps, customSafeApps],
  )

  const togglePin = (appId: number) => {
    const alreadyPinned = pinnedSafeApps.some(({ id }) => id === appId)
    if (alreadyPinned) {
      updatePinnedSafeApps(pinnedSafeAppIds.filter((id) => id !== appId.toString()))
    } else {
      updatePinnedSafeApps([...pinnedSafeAppIds, appId.toString()])
    }
  }

  return {
    allSafeApps,
    remoteSafeApps,
    pinnedSafeApps,
    customSafeApps,
    remoteSafeAppsLoading,
    customSafeAppsLoading,
    remoteSafeAppsError,
    addCustomApp,
    togglePin,
  }
}

export { useSafeApps }
