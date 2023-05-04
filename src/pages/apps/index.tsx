import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import SafeAppsSDKLink from '@/components/safe-apps/SafeAppsSDKLink'
import SafeAppsHeader from '@/components/safe-apps/SafeAppsHeader'
import SafeAppList from '@/components/safe-apps/SafeAppList'
import { AppRoutes } from '@/config/routes'

const SafeApps: NextPage = () => {
  const router = useRouter()

  const {
    remoteSafeApps,
    remoteSafeAppsLoading,
    pinnedSafeAppIds: bookmarkedSafeAppsId,
    togglePin: onBookmarkSafeApp,
  } = useSafeApps()

  // Redirect to an individual safe app page if the appUrl is in the query params
  useEffect(() => {
    const appUrl = router.query.appUrl as string
    if (appUrl) {
      router.push(AppRoutes.apps.open, { query: { safe: router.query.safe, appUrl } })
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
        <SafeAppList
          safeAppsList={remoteSafeApps}
          safeAppsListLoading={remoteSafeAppsLoading}
          bookmarkedSafeAppsId={bookmarkedSafeAppsId}
          onBookmarkSafeApp={onBookmarkSafeApp}
          showFilters
        />
      </main>
    </>
  )
}

export default SafeApps
