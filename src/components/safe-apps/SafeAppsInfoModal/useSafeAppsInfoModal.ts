import { BrowserPermission } from '@/hooks/safe-apps/permissions'
import useChainId from '@/hooks/useChainId'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { AllowedFeatures, PermissionStatus } from '../types'

const APPS_SECURITY_FEEDBACK_MODAL = 'APPS_SECURITY_FEEDBACK_MODAL'

type useSafeAppsInfoModal = {
  url: string
  permissions: AllowedFeatures[]
  addPermissions: (origin: string, permissions: BrowserPermission[]) => void
  getPermissions: (origin: string) => BrowserPermission[]
}

const useSafeAppsInfoModal = ({
  url,
  permissions,
  addPermissions,
  getPermissions,
}: useSafeAppsInfoModal): {
  isModalVisible: boolean
  isConsentAccepted: boolean
  isPermissionsReviewCompleted: boolean
  onComplete: (permissions: BrowserPermission[]) => void
} => {
  const didMount = useRef(false)
  const chainId = useChainId()
  const [consentAccepted, setConsentAccepted] = useState<boolean>(false)
  const [securityStepsStatus, setSecurityStepsStatus] = useLocalStorage(APPS_SECURITY_FEEDBACK_MODAL, {
    consentAccepted: false,
  })

  useEffect(() => {
    setConsentAccepted(securityStepsStatus.consentAccepted)
  }, [securityStepsStatus])

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }

    setSecurityStepsStatus({
      consentAccepted,
    })
  }, [consentAccepted, setSecurityStepsStatus])

  const isPermissionsReviewCompleted = useMemo(() => {
    if (!url) return false

    const safeAppRequiredFeatures = permissions || []
    const featureHasBeenGrantedOrDenied = (feature: AllowedFeatures) =>
      getPermissions(url).some((permission: BrowserPermission) => {
        return permission.feature === feature && permission.status !== PermissionStatus.PROMPT
      })

    // If the app add a new feature in the manifest we need to detect it and show the modal again
    return !!safeAppRequiredFeatures.every(featureHasBeenGrantedOrDenied)
  }, [getPermissions, permissions, url])

  const isModalVisible = useMemo(() => {
    const isComponentReady = didMount.current
    const shouldShowLegalDisclaimer = !consentAccepted
    const shouldShowAllowedFeatures = !isPermissionsReviewCompleted

    return isComponentReady && (shouldShowLegalDisclaimer || shouldShowAllowedFeatures)
  }, [consentAccepted, isPermissionsReviewCompleted])

  const onComplete = useCallback(
    (browserPermissions: BrowserPermission[]) => {
      setConsentAccepted(true)

      if (!isPermissionsReviewCompleted) {
        addPermissions(url, browserPermissions)
      }
    },
    [addPermissions, isPermissionsReviewCompleted, url],
  )

  return {
    isModalVisible,
    isPermissionsReviewCompleted,
    isConsentAccepted: consentAccepted,
    onComplete,
  }
}

export default useSafeAppsInfoModal
