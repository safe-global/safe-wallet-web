import { difference } from 'lodash'
import type { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { getAppsUsageData, rankSafeApps } from '@/services/safe-apps/track-app-usage-count'

// number of ranked Safe Apps that we want to display
const NUMBER_OF_SAFE_APPS = 5

const useRankedSafeApps = (safeApps: SafeAppData[], pinnedSafeApps: SafeAppData[]): SafeAppData[] => {
  if (!safeApps.length) return []

  const usageSafeAppsData = getAppsUsageData()
  const mostUsedSafeAppsIds = rankSafeApps(usageSafeAppsData)
  const mostUsedSafeApps = mostUsedSafeAppsIds
    .map((id) => safeApps.find((safeApp) => String(safeApp.id) === id))
    .filter(Boolean) as SafeAppData[]

  const mostUsedApps = difference(mostUsedSafeApps, pinnedSafeApps)

  const randomApps = difference(safeApps, mostUsedSafeApps, pinnedSafeApps)

  return pinnedSafeApps.concat(mostUsedApps).concat(randomApps).slice(0, NUMBER_OF_SAFE_APPS)
}

export { useRankedSafeApps }
