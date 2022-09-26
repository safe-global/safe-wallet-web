import { useMemo } from 'react'
import { sampleSize } from 'lodash'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { getAppsUsageData, rankSafeApps } from '@/services/safe-apps/track-app-usage-count'

// number of ranked Safe Apps that we include in the array
const NUMBER_OF_SAFE_APPS = 5

const useRankedSafeApps = (safeApps: SafeAppData[], pinnedSafeApps: SafeAppData[]): SafeAppData[] => {
  return useMemo(() => {
    if (!safeApps.length) return []

    const usageSafeAppsData = getAppsUsageData()
    const mostUsedSafeAppsIds = rankSafeApps(usageSafeAppsData, pinnedSafeApps).slice(0, NUMBER_OF_SAFE_APPS)
    const mostUsedSafeApps = getSafeAppDataFromIds(mostUsedSafeAppsIds, safeApps)

    // we add random Safe Apps if no enough Safe Apps are present
    const numberOfRandomSafeApps = NUMBER_OF_SAFE_APPS - mostUsedSafeApps.length
    const nonRankedApps = safeApps.filter((app) => !mostUsedSafeAppsIds.includes(String(app.id)))
    const randomSafeApps = sampleSize(nonRankedApps, numberOfRandomSafeApps)

    const rankedSafeApps = [...mostUsedSafeApps, ...randomSafeApps]

    return rankedSafeApps
  }, [safeApps, pinnedSafeApps])
}

export { useRankedSafeApps }

const getSafeAppDataFromIds = (safeAppIds: String[], safeApps: SafeAppData[]) => {
  return safeAppIds.reduce<SafeAppData[]>((acc, safeAppId) => {
    // if Safe App data is present we include it in the array
    const safeAppData = safeApps.find((safeApp) => String(safeApp.id) === safeAppId)

    if (safeAppData) {
      return [...acc, safeAppData]
    }

    return acc
  }, [])
}
