import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { useSafeAppUrl } from '@/hooks/safe-apps/useSafeAppUrl'
import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import SafeAppsSDKLink from '@/components/safe-apps/SafeAppsSDKLink'
import SafeAppsHeader from '@/components/safe-apps/SafeAppsHeader'
import SafeAppList from '@/components/safe-apps/SafeAppList'
import SafeAppsInfoModal from '@/components/safe-apps/SafeAppsInfoModal'
import useSafeAppsInfoModal from '@/components/safe-apps/SafeAppsInfoModal/useSafeAppsInfoModal'
import SafeAppsErrorBoundary from '@/components/safe-apps/SafeAppsErrorBoundary'
import SafeAppsLoadError from '@/components/safe-apps/SafeAppsErrorBoundary/SafeAppsLoadError'
import AppFrame from '@/components/safe-apps/AppFrame'
import { useSafeAppFromManifest } from '@/hooks/safe-apps/useSafeAppFromManifest'
import { useBrowserPermissions } from '@/hooks/safe-apps/permissions'
import useChainId from '@/hooks/useChainId'
import { AppRoutes } from '@/config/routes'
import { getOrigin } from '@/components/safe-apps/utils'

const SafeApps: NextPage = () => {
  const chainId = useChainId()
  const router = useRouter()

  const [appUrl, routerReady] = useSafeAppUrl()

  const {
    remoteSafeApps,
    remoteSafeAppsLoading,
    pinnedSafeAppIds: bookmarkedSafeAppsId,
    togglePin: onBookmarkSafeApp,
  } = useSafeApps()

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
              pathname: AppRoutes.apps.index,
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
        <title>Safe – Safe Apps List</title>
      </Head>

      <SafeAppsSDKLink />

      <SafeAppsHeader />

      <main>
        <SafeAppList
          safeAppsList={remoteSafeApps}
          bookmarkedSafeAppsId={bookmarkedSafeAppsId}
          onBookmarkSafeApp={onBookmarkSafeApp}
          showFilters
        />
      </main>
    </>
  )
}

export default SafeApps
