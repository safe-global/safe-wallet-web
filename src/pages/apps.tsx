import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import AppFrame from '@/components/safe-apps/AppFrame'
import SafeAppsErrorBoundary from '@/components/safe-apps/SafeAppsErrorBoundary'
import SafeAppsLoadError from '@/components/safe-apps/SafeAppsErrorBoundary/SafeAppsLoadError'
import { SafeAppList } from '@/components/safe-apps/SafeAppList'
import { useSafeAppUrl } from '@/hooks/safe-apps/useSafeAppUrl'

const Apps: NextPage = () => {
  const router = useRouter()
  const [appUrl, routerReady] = useSafeAppUrl()

  if (!routerReady) {
    return null
  }

  if (appUrl) {
    return (
      <SafeAppsErrorBoundary render={() => <SafeAppsLoadError onBackToApps={() => router.back()} />}>
        <AppFrame appUrl={appUrl} />
      </SafeAppsErrorBoundary>
    )
  }

  return (
    <>
      <Head>
        <title>Safe Apps</title>
      </Head>

      <SafeAppList />
    </>
  )
}

export default Apps
