import { useState, useEffect } from 'react'
import local from '@/services/local-storage/local'

type ReturnType = {
  pinnedSafeAppIds: Set<number>
  updatePinnedSafeApps: (newPinnedSafeAppIds: Set<number>) => void
}

const pinnedSafeAppsIdsKey = 'pinnedSafeAppsIds'

const usePinnedSafeApps = (): ReturnType => {
  const [pinnedSafeAppIds, updatePinnedSafeApps] = useState<Set<number>>(
    () => new Set(local.getItem<number[]>(pinnedSafeAppsIdsKey) || []),
  )

  useEffect(() => {
    local.setItem(pinnedSafeAppsIdsKey, Array.from(pinnedSafeAppIds))
  }, [pinnedSafeAppIds])

  return { pinnedSafeAppIds, updatePinnedSafeApps }
}

export { usePinnedSafeApps }
