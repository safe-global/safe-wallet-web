import useBalances from '@/hooks/useBalances'
import { useContext, useState } from 'react'
import type { ReactElement } from 'react'
import { useMemo } from 'react'
import { useCallback, useEffect } from 'react'
import { CircularProgress, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { getBalances, getTransactionDetails, getSafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import type {
  AddressBookItem,
  BaseTransaction,
  EIP712TypedData,
  RequestId,
  SafeSettings,
  SendTransactionRequestParams,
} from '@safe-global/safe-apps-sdk'
import { Methods } from '@safe-global/safe-apps-sdk'

import { trackSafeAppOpenCount } from '@/services/safe-apps/track-app-usage-count'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { SAFE_APPS_EVENTS, trackSafeAppEvent } from '@/services/analytics'
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
import TransactionQueueBar, { TRANSACTION_BAR_HEIGHT } from './TransactionQueueBar'
import { safeMsgSubscribe, SafeMsgEvent } from '@/services/safe-messages/safeMsgEvents'
import { useAppSelector } from '@/store'
import { selectSafeMessages } from '@/store/safeMessagesSlice'
import { isSafeMessageListItem } from '@/utils/safe-message-guards'
import { isOffchainEIP1271Supported } from '@/utils/safe-messages'
import PermissionsPrompt from '@/components/safe-apps/PermissionsPrompt'
import { PermissionStatus, type SafeAppDataWithPermissions } from '@/components/safe-apps/types'

import css from './styles.module.css'
import SafeAppIframe from './SafeAppIframe'
import useGetSafeInfo from './useGetSafeInfo'
import { hasFeature, FEATURES } from '@/utils/chains'
import { selectTokenList, selectOnChainSigning, TOKEN_LISTS } from '@/store/settingsSlice'
import { TxModalContext } from '@/components/tx-flow'
import { SafeAppsTxFlow, SignMessageFlow, SignMessageOnChainFlow } from '@/components/tx-flow/flows'

const UNKNOWN_APP_NAME = 'Unknown Safe App'

type AppFrameProps = {
  appUrl: string
  allowedFeaturesList: string
  safeAppFromManifest: SafeAppDataWithPermissions
}

const AppFrame = ({ appUrl, allowedFeaturesList, safeAppFromManifest }: AppFrameProps): ReactElement => {
  const chainId = useChainId()
  // We use offChainSigning by default
  const [settings, setSettings] = useState<SafeSettings>({
    offChainSigning: true,
  })
  const [currentRequestId, setCurrentRequestId] = useState<RequestId | undefined>()
  const safeMessages = useAppSelector(selectSafeMessages)
  const { safe, safeLoaded, safeAddress } = useSafeInfo()
  const tokenlist = useAppSelector(selectTokenList)
  const onChainSigning = useAppSelector(selectOnChainSigning)

  const addressBook = useAddressBook()
  const chain = useCurrentChain()
  const { balances } = useBalances()
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
  const { thirdPartyCookiesDisabled, setThirdPartyCookiesDisabled } = useThirdPartyCookies()
  const { iframeRef, appIsLoading, isLoadingSlow, setAppIsLoading } = useAppIsLoading()
  useAnalyticsFromSafeApp(iframeRef)
  const { getPermissions, hasPermission, permissionsRequest, setPermissionsRequest, confirmPermissionRequest } =
    useSafePermissions()
  const appName = useMemo(() => (remoteApp ? remoteApp.name : appUrl), [appUrl, remoteApp])
  const { setTxFlow } = useContext(TxModalContext)

  const onTxFlowClose = () => {
    setCurrentRequestId((prevId) => {
      if (prevId) {
        communicator?.send(CommunicatorMessages.REJECT_TRANSACTION_MESSAGE, prevId, true)
        trackSafeAppEvent(SAFE_APPS_EVENTS.PROPOSE_TRANSACTION_REJECTED, appName)
      }
      return undefined
    })
  }

  const communicator = useAppCommunicator(iframeRef, remoteApp || safeAppFromManifest, chain, {
    onConfirmTransactions: (txs: BaseTransaction[], requestId: RequestId, params?: SendTransactionRequestParams) => {
      const data = {
        app: safeAppFromManifest,
        appId: remoteApp ? String(remoteApp.id) : undefined,
        requestId: requestId,
        txs: txs,
        params: params,
      }

      setCurrentRequestId(requestId)
      setTxFlow(<SafeAppsTxFlow data={data} />, onTxFlowClose)
    },
    onSignMessage: (
      message: string | EIP712TypedData,
      requestId: string,
      method: Methods.signMessage | Methods.signTypedMessage,
      sdkVersion: string,
    ) => {
      const isOffChainSigningSupported = isOffchainEIP1271Supported(safe, chain, sdkVersion)
      const signOffChain = isOffChainSigningSupported && !onChainSigning && !!settings.offChainSigning

      setCurrentRequestId(requestId)

      if (signOffChain) {
        setTxFlow(
          <SignMessageFlow
            logoUri={safeAppFromManifest?.iconUrl || ''}
            name={safeAppFromManifest?.name || ''}
            message={message}
            safeAppId={remoteApp?.id}
            requestId={requestId}
          />,
          onTxFlowClose,
        )
      } else {
        setTxFlow(
          <SignMessageOnChainFlow
            props={{
              app: safeAppFromManifest,
              requestId,
              message,
              method,
            }}
          />,
        )
      }
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

      return safe.deployed
        ? getBalances(chainId, safeAddress, currency, {
            exclude_spam: true,
            trusted: isDefaultTokenlistSupported && TOKEN_LISTS.TRUSTED === tokenlist,
          })
        : Promise.resolve(balances)
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

  const onAcceptPermissionRequest = (_origin: string, requestId: RequestId) => {
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
    gtmTrackPageview(`${router.pathname}?appUrl=${router.query.appUrl}`, router.asPath)
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
      if (safeAppRequestId && currentRequestId === safeAppRequestId) {
        trackSafeAppEvent(SAFE_APPS_EVENTS.PROPOSE_TRANSACTION, appName)
        communicator?.send({ safeTxHash }, safeAppRequestId)
      }
    })

    return unsubscribe
  }, [appName, chainId, communicator, currentRequestId])

  useEffect(() => {
    const unsubscribe = safeMsgSubscribe(SafeMsgEvent.SIGNATURE_PREPARED, ({ messageHash, requestId, signature }) => {
      if (requestId && currentRequestId === requestId) {
        communicator?.send({ messageHash, signature }, requestId)
      }
    })

    return unsubscribe
  }, [communicator, currentRequestId])

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
