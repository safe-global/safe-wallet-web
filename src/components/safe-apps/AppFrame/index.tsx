import { useState } from 'react'
import type { ReactElement } from 'react'
import { useMemo } from 'react'
import { useCallback, useEffect } from 'react'
import { CircularProgress, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { getBalances, getTransactionDetails, getSafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import type { AddressBookItem, EIP712TypedData, RequestId, SafeSettings } from '@safe-global/safe-apps-sdk'
import { Methods } from '@safe-global/safe-apps-sdk'

import { trackSafeAppOpenCount } from '@/services/safe-apps/track-app-usage-count'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { SAFE_APPS_EVENTS, trackSafeAppEvent } from '@/services/analytics'
import { useSafeAppFromManifest } from '@/hooks/safe-apps/useSafeAppFromManifest'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useSafeAppFromBackend } from '@/hooks/safe-apps/useSafeAppFromBackend'
import useChainId from '@/hooks/useChainId'
import useAddressBook from '@/hooks/useAddressBook'
import { useSafePermissions } from '@/hooks/safe-apps/permissions'
import { useCurrentChain } from '@/hooks/useChains'
import { isSameUrl } from '@/utils/url'
import useTransactionQueueBarState from '@/components/safe-apps/AppFrame/useTransactionQueueBarState'
import { gtmTrackPageview } from '@/services/analytics/gtm'
import useThirdPartyCookies from './useThirdPartyCookies'
import useAnalyticsFromSafeApp from './useFromAppAnalytics'
import useAppIsLoading from './useAppIsLoading'
import useAppCommunicator, { CommunicatorMessages } from './useAppCommunicator'
import { ThirdPartyCookiesWarning } from './ThirdPartyCookiesWarning'
import SafeAppsTxModal from '@/components/safe-apps/SafeAppsTxModal'
import useTxModal from '@/components/safe-apps/SafeAppsTxModal/useTxModal'
import SafeAppsSignMessageModal from '@/components/safe-apps/SafeAppsSignMessageModal'
import useSignMessageModal from '@/components/safe-apps/SignMessageModal/useSignMessageModal'
import TransactionQueueBar, { TRANSACTION_BAR_HEIGHT } from './TransactionQueueBar'
import MsgModal from '@/components/safe-messages/MsgModal'
import { safeMsgSubscribe, SafeMsgEvent } from '@/services/safe-messages/safeMsgEvents'
import { useAppSelector } from '@/store'
import { selectSafeMessages } from '@/store/safeMessagesSlice'
import { isSafeMessageListItem } from '@/utils/safe-message-guards'
import { isOffchainEIP1271Supported } from '@/utils/safe-messages'
import PermissionsPrompt from '@/components/safe-apps/PermissionsPrompt'
import { PermissionStatus } from '@/components/safe-apps/types'

import css from './styles.module.css'
import SafeAppIframe from './SafeAppIframe'
import useGetSafeInfo from './useGetSafeInfo'
import { hasFeature, FEATURES } from '@/utils/chains'
import { selectTokenList, selectOnChainSigning, TOKEN_LISTS } from '@/store/settingsSlice'

const UNKNOWN_APP_NAME = 'Unknown Safe App'

type AppFrameProps = {
  appUrl: string
  allowedFeaturesList: string
}

const AppFrame = ({ appUrl, allowedFeaturesList }: AppFrameProps): ReactElement => {
  const chainId = useChainId()
  const [txModalState, openTxModal, closeTxModal] = useTxModal()
  // We use offChainSigning by default
  const [settings, setSettings] = useState<SafeSettings>({
    offChainSigning: true,
  })
  const safeMessages = useAppSelector(selectSafeMessages)
  const [signMessageModalState, openSignMessageModal, closeSignMessageModal] = useSignMessageModal()
  const { safe, safeLoaded, safeAddress } = useSafeInfo()
  const tokenlist = useAppSelector(selectTokenList)
  const onChainSigning = useAppSelector(selectOnChainSigning)

  const addressBook = useAddressBook()
  const chain = useCurrentChain()
  const router = useRouter()
  const {
    expanded: queueBarExpanded,
    dismissedByUser: queueBarDismissed,
    setExpanded,
    dismissQueueBar,
    transactions,
  } = useTransactionQueueBarState()
  const queueBarVisible = transactions.results.length > 0 && !queueBarDismissed
  const [remoteApp, , isBackendAppsLoading] = useSafeAppFromBackend(appUrl, safe.chainId)
  const { safeApp: safeAppFromManifest } = useSafeAppFromManifest(appUrl, safe.chainId)
  const { thirdPartyCookiesDisabled, setThirdPartyCookiesDisabled } = useThirdPartyCookies()
  const { iframeRef, appIsLoading, isLoadingSlow, setAppIsLoading } = useAppIsLoading()
  useAnalyticsFromSafeApp(iframeRef)
  const { getPermissions, hasPermission, permissionsRequest, setPermissionsRequest, confirmPermissionRequest } =
    useSafePermissions()
  const appName = useMemo(() => (remoteApp ? remoteApp.name : appUrl), [appUrl, remoteApp])

  const communicator = useAppCommunicator(iframeRef, remoteApp || safeAppFromManifest, chain, {
    onConfirmTransactions: openTxModal,
    onSignMessage: (
      message: string | EIP712TypedData,
      requestId: string,
      method: Methods.signMessage | Methods.signTypedMessage,
      sdkVersion: string,
    ) => {
      const isOffChainSigningSupported = isOffchainEIP1271Supported(safe, chain, sdkVersion)
      const signOffChain = isOffChainSigningSupported && !onChainSigning
      openSignMessageModal(message, requestId, method, signOffChain && !!settings.offChainSigning)
    },
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
    onGetSafeInfo: useGetSafeInfo(),
    onGetSafeBalances: (currency) => {
      const isDefaultTokenlistSupported = chain && hasFeature(chain, FEATURES.DEFAULT_TOKENLIST)
      return getBalances(chainId, safeAddress, currency, {
        exclude_spam: true,
        trusted: isDefaultTokenlistSupported && TOKEN_LISTS.TRUSTED === tokenlist,
      })
    },
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
    onSetSafeSettings: (safeSettings: SafeSettings) => {
      const newSettings: SafeSettings = {
        ...settings,
        offChainSigning: !!safeSettings.offChainSigning,
      }

      setSettings(newSettings)

      return newSettings
    },
    onGetOffChainSignature: async (messageHash: string) => {
      const safeMessage = safeMessages.data?.results
        ?.filter(isSafeMessageListItem)
        ?.find((item) => item.messageHash === messageHash)

      if (safeMessage) {
        return safeMessage.preparedSignature
      }

      try {
        const { preparedSignature } = await getSafeMessage(chainId, messageHash)
        return preparedSignature
      } catch {
        return ''
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
    if (!appIsLoading && !isBackendAppsLoading) {
      trackSafeAppEvent(
        {
          ...SAFE_APPS_EVENTS.OPEN_APP,
        },
        appName,
      )
    }
  }, [appIsLoading, isBackendAppsLoading, appName])

  useEffect(() => {
    const unsubscribe = txSubscribe(TxEvent.SAFE_APPS_REQUEST, async ({ safeAppRequestId, safeTxHash }) => {
      const currentSafeAppRequestId = signMessageModalState.requestId || txModalState.requestId

      if (currentSafeAppRequestId === safeAppRequestId) {
        trackSafeAppEvent(SAFE_APPS_EVENTS.PROPOSE_TRANSACTION, appName)

        communicator?.send({ safeTxHash }, safeAppRequestId)

        txModalState.isOpen ? closeTxModal() : closeSignMessageModal()
      }
    })

    return unsubscribe
  }, [appName, chainId, closeSignMessageModal, closeTxModal, communicator, signMessageModalState, txModalState])

  useEffect(() => {
    const unsubscribe = safeMsgSubscribe(SafeMsgEvent.SIGNATURE_PREPARED, ({ messageHash, requestId, signature }) => {
      if (signMessageModalState.requestId === requestId) {
        communicator?.send({ messageHash, signature }, requestId)
      }
    })

    return unsubscribe
  }, [communicator, signMessageModalState.requestId])

  const onSafeAppsModalClose = () => {
    if (txModalState.isOpen) {
      communicator?.send(CommunicatorMessages.REJECT_TRANSACTION_MESSAGE, txModalState.requestId, true)
      closeTxModal()
    } else {
      communicator?.send(CommunicatorMessages.REJECT_TRANSACTION_MESSAGE, signMessageModalState.requestId, true)
      closeSignMessageModal()
    }

    trackSafeAppEvent(SAFE_APPS_EVENTS.PROPOSE_TRANSACTION_REJECTED, appName)
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
        <title>{`Safe Apps - Viewer - ${remoteApp ? remoteApp.name : UNKNOWN_APP_NAME}`}</title>
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

        <div
          style={{
            height: '100%',
            display: appIsLoading ? 'none' : 'block',
            paddingBottom: queueBarVisible ? TRANSACTION_BAR_HEIGHT : 0,
          }}
        >
          <SafeAppIframe
            appUrl={appUrl}
            allowedFeaturesList={allowedFeaturesList}
            iframeRef={iframeRef}
            onLoad={onIframeLoad}
            title={safeAppFromManifest?.name}
          />
        </div>

        <TransactionQueueBar
          expanded={queueBarExpanded}
          visible={queueBarVisible && !queueBarDismissed}
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

        {signMessageModalState.isOpen &&
          (signMessageModalState.isOffChain ? (
            <MsgModal
              onClose={onSafeAppsModalClose}
              logoUri={safeAppFromManifest?.iconUrl || ''}
              name={safeAppFromManifest?.name || ''}
              message={signMessageModalState.message}
              safeAppId={remoteApp?.id}
              requestId={signMessageModalState.requestId}
            />
          ) : (
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
          ))}

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
