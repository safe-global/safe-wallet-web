import { difference, sampleSize } from 'lodash'
import type { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { getAppsUsageData, rankSafeApps } from '@/services/safe-apps/track-app-usage-count'
import { FEATURED_APPS_TAG } from '@/components/dashboard/FeaturedApps/FeaturedApps'

// number of ranked Safe Apps that we want to display
const NUMBER_OF_SAFE_APPS = 5

const useRankedSafeApps = (safeApps: SafeAppData[], pinnedSafeApps: SafeAppData[]): SafeAppData[] => {
  if (!safeApps.length) return []

  const nonFeaturedApps = safeApps.filter((app) => !app.tags?.includes(FEATURED_APPS_TAG))

  const usageSafeAppsData = getAppsUsageData()
  const mostUsedSafeAppsIds = rankSafeApps(usageSafeAppsData)
  const mostUsedSafeApps = mostUsedSafeAppsIds
    .map((id) => nonFeaturedApps.find((safeApp) => String(safeApp.id) === id))
    .filter(Boolean) as SafeAppData[]

  const mostUsedApps = difference(mostUsedSafeApps, pinnedSafeApps)

  const randomApps = sampleSize(difference(nonFeaturedApps, mostUsedSafeApps, pinnedSafeApps), NUMBER_OF_SAFE_APPS)

  return pinnedSafeApps.concat(mostUsedApps).concat(randomApps).slice(0, NUMBER_OF_SAFE_APPS)
}

export { useRankedSafeApps }
