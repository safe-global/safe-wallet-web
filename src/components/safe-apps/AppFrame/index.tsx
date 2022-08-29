import { ReactElement, useCallback, useEffect, useMemo } from 'react'
import { CircularProgress, Typography } from '@mui/material'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { RequestId } from '@gnosis.pm/safe-apps-sdk'
import { trackSafeAppOpenCount } from '@/services/safe-apps/track-app-usage-count'
import { useSafeAppFromManifest } from '@/hooks/safe-apps/useSafeAppFromManifest'
import useBalances from '@/hooks/useBalances'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { isSameUrl } from '@/utils/url'
import { ThirdPartyCookiesWarning } from './ThirdPartyCookiesWarning'
import { ConfirmTxModal } from '../ConfirmTxModal'
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
  const { safe, safeAddress } = useSafeInfo()
  const { balances } = useBalances()
  const nativeToken = balances.items.find((item) => parseInt(item.tokenInfo.address, 16) === 0)
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

  const handleConfirmTransaction = (safeTxHash: string, requestId: RequestId) => {
    communicator?.send({ safeTxHash }, requestId)
  }

  const handleRejectTransaction = (requestId: RequestId) => {
    communicator?.send(REJECT_TRANSACTION_MESSAGE, requestId, true)
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

      <ConfirmTxModal
        isOpen={confirmTransactionModalState.isOpen}
        app={safeAppFromManifest}
        appId={remoteApp?.id.toString()}
        safeAddress={safeAddress}
        ethBalance={nativeToken?.balance || ''}
        txs={confirmTransactionModalState.txs}
        onClose={closeConfirmationModal}
        requestId={confirmTransactionModalState.requestId}
        onUserConfirm={handleConfirmTransaction}
        params={confirmTransactionModalState.params}
        onTxReject={handleRejectTransaction}
      />
    </div>
  )
}

export default AppFrame
