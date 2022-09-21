import { ReactElement, useCallback, useEffect } from 'react'
import { CircularProgress, Typography } from '@mui/material'
import { getTransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { trackSafeAppOpenCount } from '@/services/safe-apps/track-app-usage-count'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { useSafeAppFromManifest } from '@/hooks/safe-apps/useSafeAppFromManifest'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useSafeAppFromBackend } from '@/hooks/safe-apps/useSafeAppFromBackend'
import useChainId from '@/hooks/useChainId'
import useAddressBook from '@/hooks/useAddressBook'
import { isSameUrl } from '@/utils/url'
import useThirdPartyCookies from './useThirdPartyCookies'
import useAppIsLoading from './useAppIsLoading'
import useAppCommunicator, { CommunicatorMessages } from './useAppCommunicator'
import useTxModal from '../SafeAppsTxModal/useTxModal'
import { ThirdPartyCookiesWarning } from './ThirdPartyCookiesWarning'
import SafeAppsTxModal from '../SafeAppsTxModal'
import SafeAppsSignMessageModal from '../SafeAppsSignMessageModal'
import useSignMessageModal from '../SignMessageModal/useSignMessageModal'
import { isMultisigDetailedExecutionInfo } from '@/utils/transaction-guards'

import css from './styles.module.css'
import { useSafePermissions } from '@/hooks/safe-apps/permissions'
import { AddressBookItem, Methods, RequestId } from '@gnosis.pm/safe-apps-sdk'
import { AddressBook } from '@/store/addressBookSlice'
import PermissionsPrompt from '../PermissionsPrompt'
import { PermissionStatus } from '../types'

type AppFrameProps = {
  appUrl: string
  allowedFeaturesList: string
}

const AppFrame = ({ appUrl, allowedFeaturesList }: AppFrameProps): ReactElement => {
  const chainId = useChainId()
  const [txModalState, openTxModal, closeTxModal] = useTxModal()
  const [signMessageModalState, openSignMessageModal, closeSignMessageModal] = useSignMessageModal()
  const { safe } = useSafeInfo()
  const addressBook = useAddressBook()
  const [remoteApp] = useSafeAppFromBackend(appUrl, safe.chainId)
  const { safeApp: safeAppFromManifest } = useSafeAppFromManifest(appUrl, safe.chainId)
  const { thirdPartyCookiesDisabled, setThirdPartyCookiesDisabled } = useThirdPartyCookies()
  const { iframeRef, appIsLoading, isLoadingSlow, setAppIsLoading } = useAppIsLoading()
  const { getPermissions, hasPermission, permissionsRequest, setPermissionsRequest, confirmPermissionRequest } =
    useSafePermissions()

  const communicator = useAppCommunicator(iframeRef, {
    app: safeAppFromManifest,
    onConfirmTransactions: openTxModal,
    onSignMessage: openSignMessageModal,
    onGetPermissions: getPermissions,
    onSetPermissions: setPermissionsRequest,
    onRequestAddressBook: (origin: string): AddressBookItem[] => {
      if (hasPermission(origin, Methods.requestAddressBook)) {
        return Object.entries(addressBook).map(([address, name]) => ({ address, name, chainId }))
      }

      return []
    },
  })

  useEffect(() => {
    if (!remoteApp) return

    trackSafeAppOpenCount(remoteApp.id)
  }, [remoteApp])

  const onIframeLoad = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe || !isSameUrl(iframe.src, appUrl)) {
      return
    }

    setAppIsLoading(false)
  }, [appUrl, iframeRef, setAppIsLoading])

  useEffect(() => {
    const unsubscribe = txSubscribe(TxEvent.SAFE_APPS_REQUEST, async ({ txId, safeAppRequestId }) => {
      const currentSafeAppRequestId = signMessageModalState.requestId || txModalState.requestId

      if (txId && currentSafeAppRequestId === safeAppRequestId) {
        const { detailedExecutionInfo } = await getTransactionDetails(chainId, txId)

        if (isMultisigDetailedExecutionInfo(detailedExecutionInfo)) {
          communicator?.send({ safeTxHash: detailedExecutionInfo.safeTxHash }, safeAppRequestId)
        }

        txModalState.isOpen ? closeTxModal() : closeSignMessageModal()
      }
    })

    return unsubscribe
  }, [chainId, closeTxModal, closeSignMessageModal, communicator, txModalState, signMessageModalState])

  const onSafeAppsModalClose = () => {
    if (txModalState.isOpen) {
      communicator?.send(CommunicatorMessages.REJECT_TRANSACTION_MESSAGE, txModalState.requestId, true)
      closeTxModal()
    } else {
      communicator?.send(CommunicatorMessages.REJECT_TRANSACTION_MESSAGE, signMessageModalState.requestId, true)
      closeSignMessageModal()
    }
  }

  const onAcceptPermissionRequest = (origin: string, requestId: RequestId) => {
    const permissions = confirmPermissionRequest(PermissionStatus.GRANTED)
    communicator?.send(permissions, requestId as string)
  }

  const onRejectPermissionRequest = (requestId?: RequestId) => {
    if (requestId) {
      confirmPermissionRequest(PermissionStatus.DENIED)
      communicator?.send('Permissions were rejected', requestId as string, true)
    } else {
      setPermissionsRequest(undefined)
    }
  }

  return (
    <div className={css.wrapper}>
      {thirdPartyCookiesDisabled && <ThirdPartyCookiesWarning onClose={() => setThirdPartyCookiesDisabled(false)} />}

      {appIsLoading && (
        <div className={css.loadingContainer}>
          {isLoadingSlow && (
            <Typography variant="h4" gutterBottom>
              The Safe App is taking too long to load, consider refreshing.
            </Typography>
          )}
          <CircularProgress size={48} color="primary" />
        </div>
      )}

      <iframe
        className={css.iframe}
        id={`iframe-${appUrl}`}
        ref={iframeRef}
        src={appUrl}
        title={safeAppFromManifest?.name}
        onLoad={onIframeLoad}
        allow={allowedFeaturesList}
        style={{ display: appIsLoading ? 'none' : 'block', border: 'none' }}
      />

      {txModalState.isOpen && (
        <SafeAppsTxModal
          onClose={onSafeAppsModalClose}
          initialData={[
            {
              app: safeAppFromManifest,
              appId: remoteApp?.id,
              requestId: txModalState.requestId,
              txs: txModalState.txs,
              params: txModalState.params,
            },
          ]}
        />
      )}

      {signMessageModalState.isOpen && (
        <SafeAppsSignMessageModal
          onClose={onSafeAppsModalClose}
          initialData={[
            {
              app: safeAppFromManifest,
              appId: remoteApp?.id,
              requestId: signMessageModalState.requestId,
              message: signMessageModalState.message,
              method: signMessageModalState.method,
            },
          ]}
        />
      )}

      {permissionsRequest && (
        <PermissionsPrompt
          isOpen
          origin={permissionsRequest.origin}
          requestId={permissionsRequest.requestId}
          onAccept={onAcceptPermissionRequest}
          onReject={onRejectPermissionRequest}
          permissions={permissionsRequest.request}
        />
      )}
    </div>
  )
}

export default AppFrame
