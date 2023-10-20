import useSafeInfo from '@/hooks/useSafeInfo'
import useWalletConnectSessions from '@/services/walletconnect/useWalletConnectSessions'
import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import { useCallback, useContext, useEffect } from 'react'
import useWcUri from './useWcUri'
import WcHeaderWidget from './WcHeaderWidget'
import WcSessionManager from './WcSessionMananger'

const WalletConnectUi = () => {
  const { error, open, setOpen } = useContext(WalletConnectContext)
  const [uri, clearUri] = useWcUri()
  const sessions = useWalletConnectSessions()
  const { safeLoaded } = useSafeInfo()

  const onOpen = useCallback(() => {
    setOpen(true)
  }, [setOpen])

  const onClose = useCallback(() => {
    setOpen(false)
    clearUri()
  }, [setOpen, clearUri])

  // Open the popup if there is a pairing code in the URL or clipboard
  useEffect(() => {
    if (safeLoaded && uri) {
      onOpen()
    }
  }, [safeLoaded, uri, onOpen])

  return (
    <WcHeaderWidget isError={!!error} isOpen={open} onOpen={onOpen} onClose={onClose} sessions={sessions}>
      <WcSessionManager sessions={sessions} uri={uri} />
    </WcHeaderWidget>
  )
}

export default WalletConnectUi
