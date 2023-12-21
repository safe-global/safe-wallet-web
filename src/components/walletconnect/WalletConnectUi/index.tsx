import { useCallback, useContext, useEffect } from 'react'
import { ErrorBoundary } from '@sentry/react'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWalletConnectSessions from '@/services/walletconnect/useWalletConnectSessions'
import { WalletConnectContext, WalletConnectProvider } from '@/services/walletconnect/WalletConnectContext'
import useWcUri from '../useWcUri'
import WcHeaderWidget from '../WcHeaderWidget'
import WcSessionManager from '../WcSessionMananger'

const WalletConnectWidget = () => {
  const { walletConnect, error, open, setOpen } = useContext(WalletConnectContext)
  const [uri, clearUri] = useWcUri()
  const sessions = useWalletConnectSessions()
  const { safeLoaded } = useSafeInfo()

  const onOpen = useCallback(() => {
    setOpen(true)
  }, [setOpen])

  const onClose = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  // Open the popup if there is a pairing code in the URL or clipboard
  useEffect(() => {
    if (safeLoaded && uri) {
      onOpen()
    }
  }, [safeLoaded, uri, onOpen])

  // Clear the pairing code when connected
  useEffect(() => {
    return walletConnect?.onSessionPropose(clearUri)
  }, [walletConnect, clearUri])

  return (
    <WcHeaderWidget isError={!!error} isOpen={open} onOpen={onOpen} onClose={onClose} sessions={sessions}>
      <WcSessionManager sessions={sessions} uri={uri} />
    </WcHeaderWidget>
  )
}

const WalletConnectUi = () => (
  <ErrorBoundary>
    <WalletConnectProvider>
      <WalletConnectWidget />
    </WalletConnectProvider>
  </ErrorBoundary>
)

export default WalletConnectUi
