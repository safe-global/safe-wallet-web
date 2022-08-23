import { useEffect, useMemo, useCallback } from 'react'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { useCustomSafeApps } from '@/hooks/safe-apps/useCustomSafeApps'
import { usePinnedSafeApps } from '@/hooks/safe-apps/usePinnedSafeApps'

type ReturnType = {
  allSafeApps: SafeAppData[]
  pinnedSafeApps: SafeAppData[]
  pinnedSafeAppIds: Set<number>
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
  pinnedSafeAppIds: Set<number>,
  updateCallback: (newIds: Set<number>) => void,
) => {
  useEffect(() => {
    if (remoteSafeApps.length > 0 && pinnedSafeAppIds.size > 0) {
      const filteredPinnedAppsIds = Array.from(pinnedSafeAppIds).filter((pinnedAppId) =>
        remoteSafeApps.some((app) => app.id === pinnedAppId),
      )
      if (filteredPinnedAppsIds.length !== pinnedSafeAppIds.size) {
        updateCallback(new Set(filteredPinnedAppsIds))
      }
    }
  }, [remoteSafeApps, pinnedSafeAppIds, updateCallback])
}

const useSafeApps = (): ReturnType => {
  const [remoteSafeApps = [], remoteSafeAppsError, remoteSafeAppsLoading] = useRemoteSafeApps()
  const { customSafeApps, loading: customSafeAppsLoading, updateCustomSafeApps } = useCustomSafeApps()
  const { pinnedSafeAppIds, updatePinnedSafeApps } = usePinnedSafeApps()

  useDeadPinnedSafeAppsRemover(remoteSafeApps, pinnedSafeAppIds, updatePinnedSafeApps)

  const allSafeApps = useMemo(
    () => remoteSafeApps.concat(customSafeApps).sort((a, b) => a.name.localeCompare(b.name)),
    [remoteSafeApps, customSafeApps],
  )

  const pinnedSafeApps = useMemo(
    () => remoteSafeApps.filter((app) => pinnedSafeAppIds.has(app.id)),
    [remoteSafeApps, pinnedSafeAppIds],
  )

  const addCustomApp = useCallback(
    (app: SafeAppData) => {
      updateCustomSafeApps([...customSafeApps, app])
    },
    [updateCustomSafeApps, customSafeApps],
  )

  const togglePin = (appId: number) => {
    const alreadyPinned = pinnedSafeAppIds.has(appId)
    const newSet = new Set(pinnedSafeAppIds)
    if (alreadyPinned) {
      newSet.delete(appId)
    } else {
      newSet.add(appId)
    }
    updatePinnedSafeApps(newSet)
  }

  return {
    allSafeApps,
    remoteSafeApps,
    pinnedSafeApps,
    pinnedSafeAppIds,
    customSafeApps,
    remoteSafeAppsLoading,
    customSafeAppsLoading,
    remoteSafeAppsError,
    addCustomApp,
    togglePin,
  }
}

export { useSafeApps }
