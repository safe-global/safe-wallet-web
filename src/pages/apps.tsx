import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { SafeAppList } from '@/components/safe-apps/SafeAppList'
import { useSafeAppUrl } from '@/hooks/safe-apps/useSafeAppUrl'
import SecurityFeedbackModal from '@/components/safe-apps/SecurityFeedbackModal'
import { useSafeAppFromManifest } from '@/hooks/safe-apps/useSafeAppFromManifest'
import useChainId from '@/hooks/useChainId'
import { useSecurityFeedbackModal } from '@/components/safe-apps/SecurityFeedbackModal/useSecurityFeedbackModal'
import SafeAppsErrorBoundary from '@/components/safe-apps/SafeAppsErrorBoundary'
import AppFrame from '@/components/safe-apps/AppFrame'
import SafeAppsLoadError from '@/components/safe-apps/SafeAppsErrorBoundary/SafeAppsLoadError'
import { useBrowserPermissions } from '@/hooks/safe-apps/permissions'

const Apps: NextPage = () => {
  const router = useRouter()
  const chainId = useChainId()
  const [appUrl, routerReady] = useSafeAppUrl()
  const { isLoading, safeApp } = useSafeAppFromManifest(appUrl || '', chainId)
  const { addPermissions, getPermissions, getAllowedFeaturesList } = useBrowserPermissions()
  const { isModalVisible, isConsentAccepted, isPermissionsReviewCompleted, onComplete } = useSecurityFeedbackModal({
    url: appUrl || '',
    permissions: safeApp?.safeAppsPermissions || [],
    addPermissions,
    getPermissions,
  })

  if (!routerReady || isLoading) {
    return null
  }

  if (appUrl) {
    if (isModalVisible) {
      return (
        <SecurityFeedbackModal
          onCancel={() => router.back()}
          onConfirm={onComplete}
          features={safeApp?.safeAppsPermissions || []}
          isConsentAccepted={isConsentAccepted}
          isPermissionsReviewCompleted={isPermissionsReviewCompleted}
        />
      )
    }

    return (
      <SafeAppsErrorBoundary render={() => <SafeAppsLoadError onBackToApps={() => router.back()} />}>
        <AppFrame appUrl={appUrl} allowedFeaturesList={getAllowedFeaturesList(appUrl)} />
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
