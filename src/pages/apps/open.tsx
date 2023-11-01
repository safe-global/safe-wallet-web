import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useContext } from 'react'
import { Box, CircularProgress } from '@mui/material'

import { useSafeAppUrl } from '@/hooks/safe-apps/useSafeAppUrl'
import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
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
import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'

// TODO: Remove this once we properly deprecate the WC app
const WC_SAFE_APP = /wallet-connect/

const SafeApps: NextPage = () => {
  const chainId = useChainId()
  const router = useRouter()
  const appUrl = useSafeAppUrl()
  const { safeApp, isLoading } = useSafeAppFromManifest(appUrl || '', chainId)

  const { remoteSafeApps, remoteSafeAppsLoading } = useSafeApps()

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

  const { setOpen } = useContext(WalletConnectContext)

  const goToList = useCallback(() => {
    router.push({
      pathname: AppRoutes.apps.index,
      query: { safe: router.query.safe },
    })
  }, [router])

  // appUrl is required to be present
  if (!appUrl || !router.isReady) return null

  if (WC_SAFE_APP.test(appUrl)) {
    setOpen(true)
    goToList()
    return null
  }

  if (isModalVisible) {
    return (
      <SafeAppsInfoModal
        key={isLoading ? 'loading' : 'loaded'}
        onCancel={goToList}
        onConfirm={onComplete}
        features={safeApp.safeAppsPermissions}
        appUrl={safeApp.url}
        isConsentAccepted={isConsentAccepted}
        isPermissionsReviewCompleted={isPermissionsReviewCompleted}
        isSafeAppInDefaultList={isSafeAppInDefaultList}
        isFirstTimeAccessingApp={isFirstTimeAccessingApp}
      />
    )
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <SafeAppsErrorBoundary render={() => <SafeAppsLoadError onBackToApps={() => router.back()} />}>
      <AppFrame appUrl={appUrl} allowedFeaturesList={getAllowedFeaturesList(origin)} safeAppFromManifest={safeApp} />
    </SafeAppsErrorBoundary>
  )
}

export default SafeApps
