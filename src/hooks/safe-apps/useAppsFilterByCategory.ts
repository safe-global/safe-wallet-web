import { useMemo } from 'react'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'

import type { safeAppCatogoryOptionType } from '@/components/new-safe-apps/SafeAppsFilters/SafeAppsFilters'

const useAppsFilterByCategory = (
  safeApps: SafeAppData[],
  selectedCategories: safeAppCatogoryOptionType[],
): SafeAppData[] => {
  const filteredApps = useMemo(() => {
    const hasSelectedCategories = selectedCategories.length > 0

    if (hasSelectedCategories) {
      return safeApps.filter((safeApp) => selectedCategories.some((category) => safeApp.tags.includes(category.value)))
    }

    return safeApps
  }, [safeApps, selectedCategories])

  return filteredApps
}

export { useAppsFilterByCategory }
