import { ReactElement, useCallback, useEffect, useMemo } from 'react'
import { CircularProgress, Typography } from '@mui/material'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
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
import useConfirmationModal from './useConfirmTransactionModal'
import { useSignMessageModal } from './useSignMessageModal'

import css from './styles.module.css'

type AppFrameProps = {
  appUrl: string
}

const REJECT_TRANSACTION_MESSAGE = 'Transaction was rejected'

const AppFrame = ({ appUrl }: AppFrameProps): ReactElement => {
  const [confirmTransactionModalState, openConfirmationModal, closeConfirmationModal] = useConfirmationModal()
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
    const unsubscribe = txSubscribe(TxEvent.MINING, ({ txHash, requestId }) => {
      if (confirmTransactionModalState.requestId === requestId) {
        communicator?.send({ safeTxHash: txHash }, confirmTransactionModalState.requestId)
        closeConfirmationModal()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [closeConfirmationModal, communicator, confirmTransactionModalState])

  const onSafeAppsModalClose = () => {
    communicator?.send(REJECT_TRANSACTION_MESSAGE, confirmTransactionModalState.requestId, true)
    closeConfirmationModal()
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
              txs: confirmTransactionModalState.txs,
              requestId: confirmTransactionModalState.requestId,
              params: confirmTransactionModalState.params,
            },
          ]}
        />
      )}
    </div>
  )
}

export default AppFrame
