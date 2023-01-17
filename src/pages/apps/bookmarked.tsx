import type { NextPage } from 'next'
import Head from 'next/head'

import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import SafeAppsHeader from '@/components/safe-apps/SafeAppsHeader/SafeAppsHeader'
import SafeAppList from '@/components/safe-apps/SafeAppList/SafeAppList'
import SafeAppsSDKLink from '@/components/safe-apps/SafeAppsSDKLink/SafeAppsSDKLink'

const BookmarkedSafeApps: NextPage = () => {
  // TODO: create a custom hook instead of use useSafeApps
  const {
    pinnedSafeApps: bookmarkedSafeApps,
    pinnedSafeAppIds: bookmarkedSafeAppsId,
    togglePin: onBookmarkSafeApp,
  } = useSafeApps()

  return (
    <>
      <Head>
        <title>Bookmarked Safe Apps</title>
      </Head>

      <SafeAppsSDKLink />

      <SafeAppsHeader />

      <main>
        <SafeAppList
          safeAppsList={bookmarkedSafeApps}
          bookmarkedSafeAppsId={bookmarkedSafeAppsId}
          onBookmarkSafeApp={onBookmarkSafeApp}
        />
      </main>
    </>
  )
}

export default BookmarkedSafeApps
