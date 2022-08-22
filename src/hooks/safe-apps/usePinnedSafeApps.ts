import { useState, useEffect } from 'react'
import local from '@/services/local-storage/local'

type ReturnType = {
  pinnedSafeAppIds: string[]
  updatePinnedSafeApps: (newPinnedSafeAppIds: string[]) => void
}

const pinnedSafeAppsIdsKey = 'pinnedSafeAppsIds'

const usePinnedSafeApps = (): ReturnType => {
  const [pinnedSafeAppIds, updatePinnedSafeApps] = useState<string[]>(
    () => local.getItem<string[]>(pinnedSafeAppsIdsKey) || [],
  )

  useEffect(() => {
    local.setItem(pinnedSafeAppsIdsKey, pinnedSafeAppIds)
  }, [pinnedSafeAppIds])

  return { pinnedSafeAppIds, updatePinnedSafeApps }
}

export { usePinnedSafeApps }
