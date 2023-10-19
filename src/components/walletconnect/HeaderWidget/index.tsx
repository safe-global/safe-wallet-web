import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { CoreTypes, SessionTypes } from '@walletconnect/types'
import type { ReactElement } from 'react'

import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import useWalletConnectSessions from '@/services/walletconnect/useWalletConnectSessions'
import { useWalletConnectClipboardUri } from '@/services/walletconnect/useWalletConnectClipboardUri'
import { useWalletConnectSearchParamUri } from '@/services/walletconnect/useWalletConnectSearchParamUri'
import Icon from './Icon'
import SessionManager from '../SessionManager'
import Popup from '../Popup'
import { SuccessBanner } from '../SuccessBanner'

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

const WalletConnectHeaderWidget = (): ReactElement => {
  const { walletConnect, setError } = useContext(WalletConnectContext)
  const [popupOpen, setPopupOpen] = useState(false)
  const iconRef = useRef<HTMLDivElement>(null)
  const sessions = useWalletConnectSessions()
  const [uri, clearUri] = usePrepopulatedUri()
  const [metadata, setMetadata] = useState<CoreTypes.Metadata>()

  const onOpenSessionManager = useCallback(() => setPopupOpen(true), [])
  const onCloseSessionManager = useCallback(() => {
    setPopupOpen(false)
    clearUri()

    setError(null)
  }, [clearUri, setError])

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

  return (
    <>
      <div ref={iconRef}>
        <Icon onClick={onOpenSessionManager} sessionCount={sessions.length} />
      </div>

      <Popup anchorEl={iconRef.current} open={popupOpen || !!uri} onClose={onCloseSessionManager}>
        <SessionManager sessions={sessions} uri={uri} />
      </Popup>

      <Popup anchorEl={iconRef.current} open={!!metadata} onClose={onCloseSuccesBanner}>
        {metadata && <SuccessBanner metadata={metadata} />}
      </Popup>
    </>
  )
}

export default WalletConnectHeaderWidget
