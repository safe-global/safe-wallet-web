import { difference, sampleSize } from 'lodash'
import type { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { rankSafeApps } from '@/services/safe-apps/track-app-usage-count'
import { FEATURED_APPS_TAG } from '@/components/dashboard/FeaturedApps/FeaturedApps'

// number of ranked Safe Apps that we want to display
const NUMBER_OF_SAFE_APPS = 5

const useRankedSafeApps = (safeApps: SafeAppData[], pinnedSafeApps: SafeAppData[]): SafeAppData[] => {
  if (!safeApps.length) return []

  const mostUsedApps = difference(rankSafeApps(safeApps), pinnedSafeApps)
  const randomApps = sampleSize(difference(safeApps, mostUsedApps, pinnedSafeApps), NUMBER_OF_SAFE_APPS)

  return pinnedSafeApps
    .concat(mostUsedApps)
    .concat(randomApps)
    .filter((app) => !app.tags.includes(FEATURED_APPS_TAG))
    .slice(0, NUMBER_OF_SAFE_APPS)
}

export { useRankedSafeApps }
