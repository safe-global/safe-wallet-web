import type { ReactElement } from 'react'
import { useMemo } from 'react'
import { useCallback, useEffect } from 'react'
import { CircularProgress, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { getBalances, getTransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import type { AddressBookItem, RequestId } from '@gnosis.pm/safe-apps-sdk'
import { Methods } from '@gnosis.pm/safe-apps-sdk'

import { trackSafeAppOpenCount } from '@/services/safe-apps/track-app-usage-count'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { SAFE_APPS_EVENTS, trackSafeAppEvent } from '@/services/analytics'
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
import useTransactionQueueBarState from '@/components/safe-apps/AppFrame/useTransactionQueueBarState'
import { gtmTrackPageview } from '@/services/analytics/gtm'
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

const UNKNOWN_APP_NAME = 'Unknown App'

type AppFrameProps = {
  appUrl: string
  allowedFeaturesList: string
}

const AppFrame = ({ appUrl, allowedFeaturesList }: AppFrameProps): ReactElement => {
  const chainId = useChainId()
  const [txModalState, openTxModal, closeTxModal] = useTxModal()
  const [signMessageModalState, openSignMessageModal, closeSignMessageModal] = useSignMessageModal()
  const { safe, safeLoaded, safeAddress } = useSafeInfo()
  const addressBook = useAddressBook()
  const chain = useCurrentChain()
  const granted = useIsGranted()
  const router = useRouter()
  const {
    expanded: queueBarExpanded,
    dismissedByUser: queueBarDismissed,
    setExpanded,
    dismissQueueBar,
    transactions,
  } = useTransactionQueueBarState()
  const queueBarVisible = transactions.results.length > 0 && !queueBarDismissed
  const [remoteApp] = useSafeAppFromBackend(appUrl, safe.chainId)
  const { safeApp: safeAppFromManifest } = useSafeAppFromManifest(appUrl, safe.chainId)
  const { thirdPartyCookiesDisabled, setThirdPartyCookiesDisabled } = useThirdPartyCookies()
  const { iframeRef, appIsLoading, isLoadingSlow, setAppIsLoading } = useAppIsLoading()
  const { getPermissions, hasPermission, permissionsRequest, setPermissionsRequest, confirmPermissionRequest } =
    useSafePermissions()
  const appName = useMemo(() => (remoteApp ? remoteApp.name : appUrl), [appUrl, remoteApp])
  const communicator = useAppCommunicator(iframeRef, remoteApp || safeAppFromManifest, chain, {
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
    gtmTrackPageview(`${router.pathname}?appUrl=${router.query.appUrl}`)
  }, [appUrl, iframeRef, setAppIsLoading, router])

  useEffect(() => {
    if (!appIsLoading) {
      trackSafeAppEvent(
        {
          ...SAFE_APPS_EVENTS.OPEN_APP,
        },
        appName,
      )
    }
  }, [appIsLoading, appName])

  useEffect(() => {
    const unsubscribe = txSubscribe(TxEvent.SAFE_APPS_REQUEST, async ({ txId, safeAppRequestId }) => {
      const currentSafeAppRequestId = signMessageModalState.requestId || txModalState.requestId

      if (txId && currentSafeAppRequestId === safeAppRequestId) {
        const { detailedExecutionInfo } = await getTransactionDetails(chainId, txId)

        if (isMultisigDetailedExecutionInfo(detailedExecutionInfo)) {
          trackSafeAppEvent(SAFE_APPS_EVENTS.TRANSACTION_CONFIRMED, appName)
          communicator?.send({ safeTxHash: detailedExecutionInfo.safeTxHash }, safeAppRequestId)
        }

        txModalState.isOpen ? closeTxModal() : closeSignMessageModal()
      }
    })

    return unsubscribe
  }, [appName, chainId, closeSignMessageModal, closeTxModal, communicator, signMessageModalState, txModalState])

  const onSafeAppsModalClose = () => {
    if (txModalState.isOpen) {
      communicator?.send(CommunicatorMessages.REJECT_TRANSACTION_MESSAGE, txModalState.requestId, true)
      closeTxModal()
    } else {
      communicator?.send(CommunicatorMessages.REJECT_TRANSACTION_MESSAGE, signMessageModalState.requestId, true)
      closeSignMessageModal()
    }

    trackSafeAppEvent(SAFE_APPS_EVENTS.TRANSACTION_REJECTED, appName)
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

  if (!safeLoaded) {
    return <div />
  }

  return (
    <>
      <Head>
        <title>Safe Apps - Viewer - {remoteApp ? remoteApp.name : UNKNOWN_APP_NAME}</title>
      </Head>

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
            paddingBottom: queueBarVisible ? TRANSACTION_BAR_HEIGHT : 0,
          }}
        />

        <TransactionQueueBar
          expanded={queueBarExpanded}
          visible={!queueBarDismissed}
          setExpanded={setExpanded}
          onDismiss={dismissQueueBar}
          transactions={transactions}
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
                method: signMessageModalState.method as Methods.signMessage | Methods.signTypedMessage,
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
    </>
  )
}

export default AppFrame
