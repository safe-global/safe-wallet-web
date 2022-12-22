import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { SafeAppList } from '@/components/safe-apps/SafeAppList'
import { useSafeAppUrl } from '@/hooks/safe-apps/useSafeAppUrl'
import SafeAppsInfoModal from '@/components/safe-apps/SafeAppsInfoModal'
import { useSafeAppFromManifest } from '@/hooks/safe-apps/useSafeAppFromManifest'
import useChainId from '@/hooks/useChainId'
import useSafeAppsInfoModal from '@/components/safe-apps/SafeAppsInfoModal/useSafeAppsInfoModal'
import SafeAppsErrorBoundary from '@/components/safe-apps/SafeAppsErrorBoundary'
import AppFrame from '@/components/safe-apps/AppFrame'
import SafeAppsLoadError from '@/components/safe-apps/SafeAppsErrorBoundary/SafeAppsLoadError'
import { useBrowserPermissions } from '@/hooks/safe-apps/permissions'
import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import { AppRoutes } from '@/config/routes'
import { getOrigin } from '@/components/safe-apps/utils'

const Apps: NextPage = () => {
  const router = useRouter()
  const chainId = useChainId()
  const [appUrl, routerReady] = useSafeAppUrl()
  const { remoteSafeApps, remoteSafeAppsLoading } = useSafeApps()
  const { isLoading, safeApp } = useSafeAppFromManifest(appUrl || '', chainId)
  const { addPermissions, getPermissions, getAllowedFeaturesList } = useBrowserPermissions()
  const origin = getOrigin(appUrl)

  const {
    isModalVisible,
    isSafeAppInDefaultList,
    isFirstTimeAccessingApp,
    isConsentAccepted,
    isPermissionsReviewCompleted,
    onComplete,
  } = useSafeAppsInfoModal({
    url: origin,
    safeApp: remoteSafeApps.find((app) => app.url === appUrl),
    permissions: safeApp?.safeAppsPermissions || [],
    addPermissions,
    getPermissions,
    remoteSafeAppsLoading,
  })

  if (!routerReady || isLoading) {
    return null
  }

  if (appUrl) {
    if (isModalVisible) {
      return (
        <SafeAppsInfoModal
          onCancel={() =>
            router.push({
              pathname: AppRoutes.apps,
              query: { safe: router.query.safe },
            })
          }
          onConfirm={onComplete}
          features={safeApp?.safeAppsPermissions || []}
          appUrl={appUrl}
          isConsentAccepted={isConsentAccepted}
          isPermissionsReviewCompleted={isPermissionsReviewCompleted}
          isSafeAppInDefaultList={isSafeAppInDefaultList}
          isFirstTimeAccessingApp={isFirstTimeAccessingApp}
        />
      )
    }

    return (
      <SafeAppsErrorBoundary render={() => <SafeAppsLoadError onBackToApps={() => router.back()} />}>
        <AppFrame appUrl={appUrl} allowedFeaturesList={getAllowedFeaturesList(origin)} />
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
