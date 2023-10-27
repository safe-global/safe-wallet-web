import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'

import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import SafeAppsSDKLink from '@/components/safe-apps/SafeAppsSDKLink'
import SafeAppsHeader from '@/components/safe-apps/SafeAppsHeader'
import SafeAppList from '@/components/safe-apps/SafeAppList'
import { AppRoutes } from '@/config/routes'
import useSafeAppsFilters from '@/hooks/safe-apps/useSafeAppsFilters'
import SafeAppsFilters from '@/components/safe-apps/SafeAppsFilters'

const SafeApps: NextPage = () => {
  const router = useRouter()
  const { remoteSafeApps, remoteSafeAppsLoading, pinnedSafeApps, pinnedSafeAppIds, togglePin } = useSafeApps()
  const { filteredApps, query, setQuery, setSelectedCategories, setOptimizedWithBatchFilter, selectedCategories } =
    useSafeAppsFilters(remoteSafeApps)
  const isFiltered = !!query || selectedCategories.length > 0

  const nonPinnedApps = useMemo(
    () => remoteSafeApps.filter((app) => !pinnedSafeAppIds.has(app.id)),
    [remoteSafeApps, pinnedSafeAppIds],
  )

  // Redirect to an individual safe app page if the appUrl is in the query params
  useEffect(() => {
    const appUrl = router.query.appUrl as string
    if (appUrl) {
      router.push({ pathname: AppRoutes.apps.open, query: { safe: router.query.safe, appUrl } })
    }
  }, [router])

  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Safe Apps'}</title>
      </Head>

      <SafeAppsSDKLink />

      <SafeAppsHeader />

      <main>
        {/* Safe Apps Filters */}
        <SafeAppsFilters
          onChangeQuery={setQuery}
          onChangeFilterCategory={setSelectedCategories}
          onChangeOptimizedWithBatch={setOptimizedWithBatchFilter}
          selectedCategories={selectedCategories}
          safeAppsList={remoteSafeApps}
        />

        {/* Pinned apps */}
        {!isFiltered && pinnedSafeApps.length > 0 && (
          <SafeAppList
            title="My pinned apps"
            safeAppsList={pinnedSafeApps}
            bookmarkedSafeAppsId={pinnedSafeAppIds}
            onBookmarkSafeApp={togglePin}
          />
        )}

        {/* All apps */}
        <SafeAppList
          title="All apps"
          safeAppsList={isFiltered ? filteredApps : nonPinnedApps}
          safeAppsListLoading={remoteSafeAppsLoading}
          bookmarkedSafeAppsId={pinnedSafeAppIds}
          onBookmarkSafeApp={togglePin}
          query={query}
        />
      </main>
    </>
  )
}

export default SafeApps
