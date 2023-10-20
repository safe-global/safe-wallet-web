import useWalletConnectSessions from '@/services/walletconnect/useWalletConnectSessions'
import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import { useCallback, useContext } from 'react'
import WcHeaderWidget from './WcHeaderWidget'
import WcSessionManager from './WcSessionMananger'

const WalletConnectUi = () => {
  const { error, open, setOpen } = useContext(WalletConnectContext)
  const sessions = useWalletConnectSessions()

  const onOpen = useCallback(() => {
    setOpen(true)
  }, [setOpen])

  const onClose = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  return (
    <WcHeaderWidget isError={!!error} isOpen={open} onOpen={onOpen} onClose={onClose} sessions={sessions}>
      <WcSessionManager sessions={sessions} />
    </WcHeaderWidget>
  )
}

export default WalletConnectUi
