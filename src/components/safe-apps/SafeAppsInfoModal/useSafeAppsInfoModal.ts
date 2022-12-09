import type { BrowserPermission } from '@/hooks/safe-apps/permissions'
import useChainId from '@/hooks/useChainId'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { useEffect, useCallback, useMemo, useRef } from 'react'
import type { AllowedFeatures } from '../types'
import { PermissionStatus } from '../types'

const SAFE_APPS_INFO_MODAL = 'SafeApps__infoModal'

type useSafeAppsInfoModal = {
  url: string
  permissions: AllowedFeatures[]
  addPermissions: (origin: string, permissions: BrowserPermission[]) => void
  getPermissions: (origin: string) => BrowserPermission[]
}

type ModalInfoProps = {
  [chainId: string]: { consentsAccepted: boolean }
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
  const [modalInfo = {}, setModalInfo] = useLocalStorage<ModalInfoProps>(SAFE_APPS_INFO_MODAL)

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }
  }, [])

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
    const shouldShowLegalDisclaimer = !modalInfo[chainId] || modalInfo[chainId].consentsAccepted === false
    const shouldShowAllowedFeatures = !isPermissionsReviewCompleted

    return isComponentReady && (shouldShowLegalDisclaimer || shouldShowAllowedFeatures)
  }, [chainId, isPermissionsReviewCompleted, modalInfo])

  const onComplete = useCallback(
    (browserPermissions: BrowserPermission[]) => {
      setModalInfo({
        ...modalInfo,
        [chainId]: {
          consentsAccepted: true,
        },
      })

      if (!isPermissionsReviewCompleted) {
        addPermissions(url, browserPermissions)
      }
    },
    [addPermissions, chainId, isPermissionsReviewCompleted, modalInfo, setModalInfo, url],
  )

  return {
    isModalVisible,
    isPermissionsReviewCompleted,
    isConsentAccepted: !!modalInfo?.[chainId]?.consentsAccepted,
    onComplete,
  }
}

export default useSafeAppsInfoModal
