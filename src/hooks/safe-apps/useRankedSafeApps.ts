import { useMemo } from 'react'
import type { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { rankSafeApps } from '@/services/safe-apps/track-app-usage-count'
import { FEATURED_APPS_TAG } from '@/components/dashboard/FeaturedApps/FeaturedApps'

// number of ranked Safe Apps that we want to display
const NUMBER_OF_SAFE_APPS = 5

const useRankedSafeApps = (safeApps: SafeAppData[], pinnedSafeApps: SafeAppData[]): SafeAppData[] => {
  return useMemo(() => {
    if (!safeApps.length) return []

    const mostUsedApps = rankSafeApps(safeApps)
    const rankedPinnedApps = rankSafeApps(pinnedSafeApps)
    const randomApps = safeApps.slice().sort(() => Math.random() - 0.5)

    const allRankedApps = rankedPinnedApps
      .concat(pinnedSafeApps, mostUsedApps, randomApps)
      // Filter out Featured Apps because they are in their own section
      .filter((app) => !app.tags.includes(FEATURED_APPS_TAG))

    // Use a Set to remove duplicates
    return [...new Set(allRankedApps)].slice(0, NUMBER_OF_SAFE_APPS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeApps])
}

export { useRankedSafeApps }
