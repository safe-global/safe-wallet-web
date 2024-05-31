import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo } from 'react'
import debounce from 'lodash/debounce'

import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import SafeAppsSDKLink from '@/components/safe-apps/SafeAppsSDKLink'
import SafeAppsHeader from '@/components/safe-apps/SafeAppsHeader'
import SafeAppList from '@/components/safe-apps/SafeAppList'
import { AppRoutes } from '@/config/routes'
import useSafeAppsFilters from '@/hooks/safe-apps/useSafeAppsFilters'
import SafeAppsFilters from '@/components/safe-apps/SafeAppsFilters'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import { SafeAppAccessPolicyTypes } from '@safe-global/safe-gateway-typescript-sdk'
import { useNativeSwapsAppCard } from '@/components/safe-apps/hooks/useNativeSwapsAppCard'

const getSwapAppBanner = (): SafeAppData => {
  return {
    id: 100_000,
    url: '',
    name: 'Native swaps are here!',
    description: 'Experience seamless trading with better decoding and security in native swaps.',
    accessControl: { type: SafeAppAccessPolicyTypes.NoRestrictions },
    tags: ['DeFi'],
    features: [],
    socialProfiles: [],
    developerWebsite: '',
    chainIds: ['11155111'],
    iconUrl: '@/public/images/common/swap.svg',
  }
}

const SafeApps: NextPage = () => {
  const router = useRouter()
  const { swapsCardDetails } = useNativeSwapsAppCard()
  const { remoteSafeApps, remoteSafeAppsLoading, pinnedSafeApps, pinnedSafeAppIds, togglePin } = useSafeApps()
  const allApps = [swapsCardDetails, ...remoteSafeApps]
  const { filteredApps, query, setQuery, setSelectedCategories, setOptimizedWithBatchFilter, selectedCategories } =
    useSafeAppsFilters(allApps)
  const isFiltered = filteredApps.length !== remoteSafeApps.length
  const isSafeAppsEnabled = useHasFeature(FEATURES.SAFE_APPS)

  const nonPinnedApps = useMemo(
    () => remoteSafeApps.filter((app) => !pinnedSafeAppIds.has(app.id)),
    [remoteSafeApps, pinnedSafeAppIds],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChangeQuery = useCallback(debounce(setQuery, 300), [])

  // Redirect to an individual safe app page if the appUrl is in the query params
  useEffect(() => {
    const appUrl = router.query.appUrl as string
    if (appUrl) {
      router.push({ pathname: AppRoutes.apps.open, query: { safe: router.query.safe, appUrl } })
    }
  }, [router])

  if (!isSafeAppsEnabled) return <></>

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
          onChangeQuery={onChangeQuery}
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
