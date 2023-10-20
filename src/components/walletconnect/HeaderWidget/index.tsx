import { useCallback, useContext, useEffect, useRef } from 'react'
import type { ReactElement } from 'react'

import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import useWalletConnectSessions from '@/services/walletconnect/useWalletConnectSessions'
import { useWalletConnectClipboardUri } from '@/services/walletconnect/useWalletConnectClipboardUri'
import { useWalletConnectSearchParamUri } from '@/services/walletconnect/useWalletConnectSearchParamUri'
import Icon from './Icon'
import SessionManager from '../SessionManager'
import Popup from '../Popup'
import { ConnectionBanner } from '../ConnectionBanner'
import useSafeInfo from '@/hooks/useSafeInfo'
import { isUnsupportedChain } from '@/services/walletconnect/utils'
import { useDeferredListener } from '@/hooks/useDefferedListener'

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

const BANNER_TIMEOUT = 2_000

const useSuccessSession = (onCloseSessionManager: () => void) => {
  const { walletConnect } = useContext(WalletConnectContext)

  return useDeferredListener({
    listener: walletConnect?.onSessionAdd,
    cb: onCloseSessionManager,
    ms: BANNER_TIMEOUT,
  })
}

const useDeleteSession = () => {
  const { walletConnect } = useContext(WalletConnectContext)

  return useDeferredListener({
    listener: walletConnect?.onSessionDelete,
    ms: BANNER_TIMEOUT * 2,
  })
}

const WalletConnectHeaderWidget = (): ReactElement => {
  const { walletConnect, setError, open, setOpen } = useContext(WalletConnectContext)
  const { safe } = useSafeInfo()
  const iconRef = useRef<HTMLDivElement>(null)
  const sessions = useWalletConnectSessions()
  const [uri, clearUri] = usePrepopulatedUri()

  const onOpenSessionManager = useCallback(() => setOpen(true), [setOpen])

  const onCloseSessionManager = useCallback(() => {
    setOpen(false)
    clearUri()
    setError(null)
  }, [setOpen, clearUri, setError])

  const [successSession, setSuccessSession] = useSuccessSession(onCloseSessionManager)
  const [deleteSession, setDeleteSession] = useDeleteSession()

  const session = successSession || deleteSession
  const metadata = session?.peer?.metadata
  const isUnsupported = deleteSession ? isUnsupportedChain(deleteSession, safe.chainId) : false

  const onCloseConnectionBanner = useCallback(() => {
    setSuccessSession(undefined)
    setDeleteSession(undefined)
  }, [setSuccessSession, setDeleteSession])

  // Clear search param/clipboard state to prevent it being automatically entered again
  useEffect(() => {
    if (walletConnect) {
      return walletConnect.onSessionReject(clearUri)
    }
  }, [clearUri, walletConnect])

  // Open the popup when a prepopulated uri is found
  useEffect(() => {
    if (uri) setOpen(true)
  }, [uri, setOpen])

  return (
    <>
      <div ref={iconRef}>
        <Icon onClick={onOpenSessionManager} sessionCount={sessions.length} />
      </div>

      <Popup anchorEl={iconRef.current} open={open} onClose={onCloseSessionManager}>
        <SessionManager sessions={sessions} uri={uri} />
      </Popup>

      <Popup anchorEl={iconRef.current} open={!!metadata} onClose={onCloseConnectionBanner}>
        <ConnectionBanner metadata={metadata} isDelete={isUnsupported} />
      </Popup>
    </>
  )
}

export default WalletConnectHeaderWidget
