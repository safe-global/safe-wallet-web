import { ReactElement, useCallback, useEffect } from 'react'
import { CircularProgress, Typography } from '@mui/material'
import { getBalances, getTransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { AddressBookItem, Methods, RequestId } from '@gnosis.pm/safe-apps-sdk'

import { trackSafeAppOpenCount } from '@/services/safe-apps/track-app-usage-count'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { SAFE_APPS_EVENTS, trackEvent } from '@/services/analytics'
import { useSafeAppFromManifest } from '@/hooks/safe-apps/useSafeAppFromManifest'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useSafeAppFromBackend } from '@/hooks/safe-apps/useSafeAppFromBackend'
import useChainId from '@/hooks/useChainId'
import useAddressBook from '@/hooks/useAddressBook'
import { useSafePermissions } from '@/hooks/safe-apps/permissions'
import useIsGranted from '@/hooks/useIsGranted'
import { useCurrentChain } from '@/hooks/useChains'
import { isSameUrl } from '@/utils/url'
import { isMultisigDetailedExecutionInfo } from '@/utils/transaction-guards'
import { getLegacyChainName } from '../utils'
import useThirdPartyCookies from './useThirdPartyCookies'
import useAppIsLoading from './useAppIsLoading'
import useAppCommunicator, { CommunicatorMessages } from './useAppCommunicator'
import { ThirdPartyCookiesWarning } from './ThirdPartyCookiesWarning'
import SafeAppsTxModal from '../SafeAppsTxModal'
import useTxModal from '../SafeAppsTxModal/useTxModal'
import SafeAppsSignMessageModal from '../SafeAppsSignMessageModal'
import useSignMessageModal from '../SignMessageModal/useSignMessageModal'
import TransactionQueueBar, { TRANSACTION_BAR_HEIGHT } from './TransactionQueueBar'
import PermissionsPrompt from '../PermissionsPrompt'
import { PermissionStatus } from '../types'

import css from './styles.module.css'
import useTransactionQueueBarState from '@/components/safe-apps/AppFrame/useTransactionQueueBarState'

const UNKNOWN_APP = 'unknown'

type AppFrameProps = {
  appUrl: string
  allowedFeaturesList: string
}

const AppFrame = ({ appUrl, allowedFeaturesList }: AppFrameProps): ReactElement => {
  const chainId = useChainId()
  const [txModalState, openTxModal, closeTxModal] = useTxModal()
  const [signMessageModalState, openSignMessageModal, closeSignMessageModal] = useSignMessageModal()
  const { safe, safeAddress } = useSafeInfo()
  const addressBook = useAddressBook()
  const chain = useCurrentChain()
  const granted = useIsGranted()
  const {
    expanded: queueBarExpanded,
    dismissedByUser: queueBarDismissed,
    setExpanded,
    dismissQueueBar,
  } = useTransactionQueueBarState()

  const [remoteApp] = useSafeAppFromBackend(appUrl, safe.chainId)
  const { safeApp: safeAppFromManifest } = useSafeAppFromManifest(appUrl, safe.chainId)
  const { thirdPartyCookiesDisabled, setThirdPartyCookiesDisabled } = useThirdPartyCookies()
  const { iframeRef, appIsLoading, isLoadingSlow, setAppIsLoading } = useAppIsLoading()
  const { getPermissions, hasPermission, permissionsRequest, setPermissionsRequest, confirmPermissionRequest } =
    useSafePermissions()

  const communicator = useAppCommunicator(iframeRef, safeAppFromManifest, chain, {
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
    onGetTxBySafeTxHash: (safeTxHash) => getTransactionDetails(chainId, safeTxHash),
    onGetEnvironmentInfo: () => ({
      origin: document.location.origin,
    }),
    onGetSafeInfo: () => ({
      safeAddress,
      chainId: parseInt(chainId, 10),
      owners: safe.owners.map((owner) => owner.value),
      threshold: safe.threshold,
      isReadOnly: !granted,
      network: getLegacyChainName(chain?.chainName || '', chainId).toUpperCase(),
    }),
    onGetSafeBalances: (currency) =>
      getBalances(chainId, safeAddress, currency, {
        exclude_spam: true,
        trusted: false,
      }),
    onGetChainInfo: () => {
      if (!chain) return

      const { nativeCurrency, chainName, chainId, shortName, blockExplorerUriTemplate } = chain

      return {
        chainName,
        chainId,
        shortName,
        nativeCurrency,
        blockExplorerUriTemplate,
      }
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
    if (!appIsLoading) {
      trackEvent({
        ...SAFE_APPS_EVENTS.OPEN_APP,
        label: remoteApp?.name || `${safeAppFromManifest?.name || UNKNOWN_APP} - ${appUrl}`,
      })
    }
  }, [appIsLoading, remoteApp, appUrl, safeAppFromManifest])

  useEffect(() => {
    const unsubscribe = txSubscribe(TxEvent.SAFE_APPS_REQUEST, async ({ txId, safeAppRequestId }) => {
      const currentSafeAppRequestId = signMessageModalState.requestId || txModalState.requestId

      if (txId && currentSafeAppRequestId === safeAppRequestId) {
        const { detailedExecutionInfo } = await getTransactionDetails(chainId, txId)

        if (isMultisigDetailedExecutionInfo(detailedExecutionInfo)) {
          trackEvent({ ...SAFE_APPS_EVENTS.TRANSACTION_CONFIRMED, label: safeAppFromManifest?.name })
          communicator?.send({ safeTxHash: detailedExecutionInfo.safeTxHash }, safeAppRequestId)
        }

        txModalState.isOpen ? closeTxModal() : closeSignMessageModal()
      }
    })

    return unsubscribe
  }, [
    chainId,
    closeTxModal,
    closeSignMessageModal,
    communicator,
    txModalState,
    signMessageModalState,
    safeAppFromManifest,
  ])

  const onSafeAppsModalClose = () => {
    if (txModalState.isOpen) {
      communicator?.send(CommunicatorMessages.REJECT_TRANSACTION_MESSAGE, txModalState.requestId, true)
      closeTxModal()
    } else {
      communicator?.send(CommunicatorMessages.REJECT_TRANSACTION_MESSAGE, signMessageModalState.requestId, true)
      closeSignMessageModal()
    }

    trackEvent({ ...SAFE_APPS_EVENTS.TRANSACTION_REJECTED, label: safeAppFromManifest?.name })
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
        style={{
          display: appIsLoading ? 'none' : 'block',
          paddingBottom: !queueBarDismissed ? TRANSACTION_BAR_HEIGHT : 0,
        }}
      />

      <TransactionQueueBar
        expanded={queueBarExpanded}
        visible={!queueBarDismissed}
        setExpanded={setExpanded}
        onDismiss={dismissQueueBar}
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
