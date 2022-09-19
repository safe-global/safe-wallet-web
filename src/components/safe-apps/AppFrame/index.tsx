import { ReactElement, useCallback, useEffect } from 'react'
import { CircularProgress, Typography } from '@mui/material'
import { getTransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { trackSafeAppOpenCount } from '@/services/safe-apps/track-app-usage-count'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { useSafeAppFromManifest } from '@/hooks/safe-apps/useSafeAppFromManifest'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useSafeAppFromBackend } from '@/hooks/safe-apps/useSafeAppFromBackend'
import useChainId from '@/hooks/useChainId'
import { isSameUrl } from '@/utils/url'
import useThirdPartyCookies from './useThirdPartyCookies'
import useAppIsLoading from './useAppIsLoading'
import useAppCommunicator from './useAppCommunicator'
import useTxModal from '../SafeAppsTxModal/useTxModal'
import { ThirdPartyCookiesWarning } from './ThirdPartyCookiesWarning'
import SafeAppsTxModal from '../SafeAppsTxModal'
import SafeAppsSignMessageModal from '../SafeAppsSignMessageModal'
import useSignMessageModal from '../SignMessageModal/useSignMessageModal'
import { isMultisigDetailedExecutionInfo } from '@/utils/transaction-guards'

import css from './styles.module.css'

type AppFrameProps = {
  appUrl: string
}

const REJECT_TRANSACTION_MESSAGE = 'Transaction was rejected'

const AppFrame = ({ appUrl }: AppFrameProps): ReactElement => {
  const chainId = useChainId()
  const [txModalState, openTxModal, closeTxModal] = useTxModal()
  const [signMessageModalState, openSignMessageModal, closeSignMessageModal] = useSignMessageModal()
  const { safe } = useSafeInfo()

  const [remoteApp] = useSafeAppFromBackend(appUrl, safe.chainId)
  const { safeApp: safeAppFromManifest } = useSafeAppFromManifest(appUrl, safe.chainId)
  const { thirdPartyCookiesDisabled, setThirdPartyCookiesDisabled } = useThirdPartyCookies()
  const { iframeRef, appIsLoading, isLoadingSlow, setAppIsLoading } = useAppIsLoading()

  const communicator = useAppCommunicator(iframeRef, {
    app: safeAppFromManifest,
    onConfirmTransactions: openTxModal,
    onSignTransactions: openSignMessageModal,
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
    const unsubscribe = txSubscribe(TxEvent.SAFE_APPS_REQUEST, async ({ txId, requestId }) => {
      const currentRequestId = signMessageModalState.requestId || txModalState.requestId

      if (txId && currentRequestId === requestId) {
        const { detailedExecutionInfo } = await getTransactionDetails(chainId, txId)

        if (isMultisigDetailedExecutionInfo(detailedExecutionInfo)) {
          communicator?.send({ safeTxHash: detailedExecutionInfo.safeTxHash }, requestId)
        }

        txModalState.isOpen ? closeTxModal() : closeSignMessageModal()
      }
    })

    return unsubscribe
  }, [chainId, closeTxModal, closeSignMessageModal, communicator, txModalState, signMessageModalState])

  const onSafeAppsModalClose = () => {
    if (txModalState.isOpen) {
      communicator?.send(REJECT_TRANSACTION_MESSAGE, txModalState.requestId, true)
      closeTxModal()
    } else {
      communicator?.send(REJECT_TRANSACTION_MESSAGE, signMessageModalState.requestId, true)
      closeSignMessageModal()
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
        allow="camera"
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
    </div>
  )
}

export default AppFrame
