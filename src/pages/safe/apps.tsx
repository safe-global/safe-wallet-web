import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import AppFrame from '@/components/safe-apps/AppFrame'
import SafeAppsErrorBoundary from '@/components/safe-apps/SafeAppsErrorBoundary'
import SafeAppsLoadError from '@/components/safe-apps/SafeAppsErrorBoundary/SafeAppsLoadError'
import AppList from '@/components/safe-apps/AppList'
import Head from 'next/head'

const Apps: NextPage = () => {
  const router = useRouter()
  const { appUrl } = router.query

  if (!router.isReady) {
    return null
  }

  if (appUrl) {
    return (
      <SafeAppsErrorBoundary render={() => <SafeAppsLoadError onBackToApps={() => router.back()} />}>
        <AppFrame appUrl={Array.isArray(appUrl) ? appUrl[0] : appUrl} />
      </SafeAppsErrorBoundary>
    )
  }

  return (
    <main style={{ padding: 0 }}>
      <Head>
        <title>Safe Apps</title>
      </Head>

      <AppList />
    </main>
  )
}

export default Apps
