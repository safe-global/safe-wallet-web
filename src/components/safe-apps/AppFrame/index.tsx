import { ReactElement, useCallback, useEffect, useMemo } from 'react'
import { CircularProgress, Typography } from '@mui/material'
import { getTransactionDetails, SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { trackSafeAppOpenCount } from '@/services/safe-apps/track-app-usage-count'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { useSafeAppFromManifest } from '@/hooks/safe-apps/useSafeAppFromManifest'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { isSameUrl } from '@/utils/url'
import { ThirdPartyCookiesWarning } from './ThirdPartyCookiesWarning'
import SafeAppsTxModal from '../SafeAppsTxModal'
import useThirdPartyCookies from './useThirdPartyCookies'
import useAppIsLoading from './useAppIsLoading'
import useAppCommunicator from './useAppCommunicator'
import useConfirmTransactionModal from './useConfirmTransactionModal'
import useSignMessageModal from './useSignMessageModal'

import css from './styles.module.css'
import SafeAppsSignMessageModal from '../SafeAppsSignMessageModal'
import useChainId from '@/hooks/useChainId'
import { isMultisigExecutionDetails } from '@/utils/transaction-guards'

type AppFrameProps = {
  appUrl: string
}

const REJECT_TRANSACTION_MESSAGE = 'Transaction was rejected'

const AppFrame = ({ appUrl }: AppFrameProps): ReactElement => {
  const chainId = useChainId()
  const [confirmTransactionModalState, openConfirmationModal, closeConfirmationModal] = useConfirmTransactionModal()
  const [signMessageModalState, openSignMessageModal, closeSignMessageModal] = useSignMessageModal()
  const { safe } = useSafeInfo()
  const [remoteApps] = useRemoteSafeApps()
  const { safeApp: safeAppFromManifest } = useSafeAppFromManifest(appUrl, safe.chainId)
  const { thirdPartyCookiesDisabled, setThirdPartyCookiesDisabled } = useThirdPartyCookies()
  const { iframeRef, appIsLoading, isLoadingSlow, setAppIsLoading } = useAppIsLoading()

  const communicator = useAppCommunicator(iframeRef, {
    app: safeAppFromManifest,
    onConfirmTransactions: openConfirmationModal,
    onSignTransactions: openSignMessageModal,
  })

  const remoteApp = useMemo(() => remoteApps?.find((app: SafeAppData) => app.url === appUrl), [remoteApps, appUrl])

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
      const currentRequestId = signMessageModalState.requestId || confirmTransactionModalState.requestId

      if (txId && currentRequestId === requestId) {
        const { detailedExecutionInfo } = await getTransactionDetails(chainId, txId)

        if (isMultisigExecutionDetails(detailedExecutionInfo)) {
          communicator?.send({ safeTxHash: detailedExecutionInfo.safeTxHash }, requestId)
        }

        confirmTransactionModalState.isOpen ? closeConfirmationModal() : closeSignMessageModal()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [
    chainId,
    closeConfirmationModal,
    closeSignMessageModal,
    communicator,
    confirmTransactionModalState,
    signMessageModalState,
  ])

  const onSafeAppsModalClose = () => {
    if (confirmTransactionModalState.isOpen) {
      communicator?.send(REJECT_TRANSACTION_MESSAGE, confirmTransactionModalState.requestId, true)
      closeConfirmationModal()
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
        frameBorder="0"
        id={`iframe-${appUrl}`}
        ref={iframeRef}
        src={appUrl}
        title={safeAppFromManifest?.name}
        onLoad={onIframeLoad}
        allow="camera"
        style={{ display: appIsLoading ? 'none' : 'block' }}
      />

      {confirmTransactionModalState.isOpen && (
        <SafeAppsTxModal
          onClose={onSafeAppsModalClose}
          initialData={[
            {
              app: safeAppFromManifest,
              appId: remoteApp?.id,
              requestId: confirmTransactionModalState.requestId,
              txs: confirmTransactionModalState.txs,
              params: confirmTransactionModalState.params,
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
