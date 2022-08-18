import { useState, useEffect } from 'react'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import local from '@/services/local-storage/local'

type ReturnType = {
  pinnedSafeAppIds: string[]
  updatePinnedSafeApps: (newPinnedSafeAppIds: string[]) => void
}

const pinnedSafeAppsIdsKey = 'pinnedSafeAppsIds'

const usePinnedSafeApps = (remoteSafeApps: SafeAppData[], remoteSafeAppsLoaded: boolean): ReturnType => {
  const [pinnedSafeAppIds, updatePinnedSafeApps] = useState<string[]>(
    () => local.getItem<string[]>(pinnedSafeAppsIdsKey) || [],
  )

  useEffect(() => {
    // Filter out the pinned apps that are not in the remote list anymore
    if (remoteSafeAppsLoaded) {
      const filteredPinnedAppsIds = pinnedSafeAppIds.filter((pinnedAppId) =>
        remoteSafeApps.some((app) => app.id === +pinnedAppId),
      )
      updatePinnedSafeApps(filteredPinnedAppsIds)
    }
  }, [pinnedSafeAppIds, remoteSafeApps, remoteSafeAppsLoaded])

  // we only update pinned apps in the localStorage when remote Apps are loaded
  useEffect(() => {
    local.setItem(pinnedSafeAppsIdsKey, pinnedSafeAppIds)
  }, [pinnedSafeAppIds])

  return { pinnedSafeAppIds, updatePinnedSafeApps }
}

export { usePinnedSafeApps }
