import { ErrorBoundary } from '@sentry/react'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { CoreTypes, SessionTypes } from '@walletconnect/types'
import type { ReactElement } from 'react'

import { WalletConnectContext, WalletConnectProvider } from '@/services/walletconnect/WalletConnectContext'
import useWalletConnectSessions from '@/services/walletconnect/useWalletConnectSessions'
import { useWalletConnectClipboardUri } from '@/services/walletconnect/useWalletConnectClipboardUri'
import { useWalletConnectSearchParamUri } from '@/services/walletconnect/useWalletConnectSearchParamUri'
import Icon from './Icon'
import SessionManager from '../SessionManager'
import Popup from '../Popup'
import { SuccessBanner } from '../SuccessBanner'
import { useAppDispatch, useAppSelector } from '@/store'
import { closeWalletConnect, openWalletConnect, selectWalletConnectPopup } from '@/store/popupSlice'
import { ErrorFalllback } from './ErrorFalllback'

const usePrepopulatedUri = (): [string, () => void] => {
  const [searchParamWcUri, setSearchParamWcUri] = useWalletConnectSearchParamUri()
  const [clipboardWcUri, setClipboardWcUri] = useWalletConnectClipboardUri()
  const uri = searchParamWcUri || clipboardWcUri

  const clearUri = useCallback(() => {
    setSearchParamWcUri(null)
    // This does not clear the system clipboard, just state
    setClipboardWcUri('')
  }, [setClipboardWcUri, setSearchParamWcUri])

  return [uri, clearUri]
}

const HeaderWidget = (): ReactElement => {
  const { walletConnect, error, setError } = useContext(WalletConnectContext)
  const { open } = useAppSelector(selectWalletConnectPopup)
  const dispatch = useAppDispatch()
  const iconRef = useRef<HTMLDivElement>(null)
  const sessions = useWalletConnectSessions()
  const [uri, clearUri] = usePrepopulatedUri()
  const [metadata, setMetadata] = useState<CoreTypes.Metadata>()

  const onOpenSessionManager = useCallback(() => dispatch(openWalletConnect()), [dispatch])

  const onCloseSessionManager = useCallback(() => {
    dispatch(closeWalletConnect())
    clearUri()
    setError(null)
  }, [dispatch, clearUri, setError])

  const onCloseSuccesBanner = useCallback(() => setMetadata(undefined), [])

  const onSuccess = useCallback(
    ({ peer }: SessionTypes.Struct) => {
      onCloseSessionManager()

      // Show success banner
      setMetadata(peer.metadata)

      setTimeout(() => {
        onCloseSuccesBanner()
      }, 2_000)
    },
    [onCloseSessionManager, onCloseSuccesBanner],
  )

  useEffect(() => {
    if (!walletConnect) {
      return
    }

    return walletConnect.onSessionAdd(onSuccess)
  }, [onSuccess, walletConnect])

  useEffect(() => {
    if (!walletConnect) {
      return
    }

    return walletConnect.onSessionReject(clearUri)
  }, [clearUri, walletConnect])

  // Open the popup when a prepopulated uri is found
  useEffect(() => {
    if (uri) dispatch(openWalletConnect())
  }, [uri, dispatch])

  return (
    <ErrorBoundary
      fallback={({ error }) => (
        <ErrorFalllback onOpen={onOpenSessionManager} onClose={onCloseSessionManager} open={open} error={error} />
      )}
    >
      <div ref={iconRef}>
        <Icon onClick={onOpenSessionManager} sessionCount={sessions.length} error={!!error} />
      </div>

      <Popup anchorEl={iconRef.current} open={open} onClose={onCloseSessionManager}>
        <SessionManager sessions={sessions} uri={uri} />
      </Popup>

      <Popup anchorEl={iconRef.current} open={!!metadata} onClose={onCloseSuccesBanner}>
        {metadata && <SuccessBanner metadata={metadata} />}
      </Popup>
    </ErrorBoundary>
  )
}

const WalletConnectHeaderWidget = (): ReactElement => {
  // Provider wraps widget so ErrorBoundary is isolated to this component
  return (
    <WalletConnectProvider>
      <HeaderWidget />
    </WalletConnectProvider>
  )
}

export default WalletConnectHeaderWidget
