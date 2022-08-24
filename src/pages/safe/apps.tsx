import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import AppFrame from '@/components/safe-apps/AppFrame'
import SafeAppsErrorBoundary from '@/components/safe-apps/SafeAppsErrorBoundary'
import SafeAppsLoadError from '@/components/safe-apps/SafeAppsErrorBoundary/SafeAppsLoadError'
import Head from 'next/head'
import { SafeAppList } from '@/components/safe-apps/SafeAppList'

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

      <SafeAppList />
    </main>
  )
}

export default Apps
