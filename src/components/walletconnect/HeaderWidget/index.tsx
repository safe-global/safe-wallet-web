import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Badge } from '@mui/material'
import type { CoreTypes, SessionTypes } from '@walletconnect/types'
import type { ReactElement } from 'react'

import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import useWalletConnectSessions from '@/services/walletconnect/useWalletConnectSessions'
import Icon from './Icon'
import SessionManager from '../SessionManager'
import Popup from '../Popup'
import { useWalletConnectSearchParamUri } from '@/services/walletconnect/useWalletConnectSearchParamUri'
import { SuccessBanner } from '../SuccessBanner'

const WalletConnectHeaderWidget = (): ReactElement => {
  const { error, walletConnect } = useContext(WalletConnectContext)
  const [popupOpen, setPopupOpen] = useState(false)
  const [wcUri] = useWalletConnectSearchParamUri()
  const iconRef = useRef<HTMLDivElement>(null)
  const sessions = useWalletConnectSessions()
  const [metadata, setMetadata] = useState<CoreTypes.Metadata>()

  const onOpenSessionManager = useCallback(() => setPopupOpen(true), [])
  const onCloseSessionManager = useCallback(() => setPopupOpen(false), [])

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

  return (
    <>
      <div ref={iconRef}>
        <Icon
          onClick={onOpenSessionManager}
          sessionCount={sessions.length}
          sessionInfo={
            sessions[0]
              ? { name: sessions[0].peer.metadata.name, iconUrl: sessions[0].peer.metadata.icons[0] }
              : undefined
          }
        />
        <Badge color="error" variant="dot" invisible={!error} />
      </div>

      <Popup anchorEl={iconRef.current} open={popupOpen || !!wcUri} onClose={onCloseSessionManager} keepMounted>
        <SessionManager sessions={sessions} />
      </Popup>

      <Popup anchorEl={iconRef.current} open={!!metadata} onClose={onCloseSuccesBanner}>
        {metadata && <SuccessBanner metadata={metadata} />}
      </Popup>
    </>
  )
}

export default WalletConnectHeaderWidget
