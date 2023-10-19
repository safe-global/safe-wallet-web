import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { CoreTypes, SessionTypes } from '@walletconnect/types'
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
import { getEip155ChainId, getSupportedEip155ChainIds } from '@/services/walletconnect/utils'

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

const useSuccessMetadata = (
  onCloseSessionManager: () => void,
): [CoreTypes.Metadata | undefined, Dispatch<SetStateAction<CoreTypes.Metadata | undefined>>] => {
  const { walletConnect } = useContext(WalletConnectContext)
  const [metadata, setMetadata] = useState<CoreTypes.Metadata>()

  const onSuccess = useCallback(
    ({ peer }: SessionTypes.Struct) => {
      onCloseSessionManager()

      // Show success banner
      setMetadata(peer.metadata)

      return setTimeout(() => {
        setMetadata(undefined)
      }, BANNER_TIMEOUT)
    },
    [onCloseSessionManager],
  )

  useEffect(() => {
    if (!walletConnect) return

    let timeout: NodeJS.Timeout

    walletConnect.onSessionAdd((session) => {
      timeout = onSuccess(session)
    })

    return () => clearTimeout(timeout)
  }, [onSuccess, walletConnect])

  return [metadata, setMetadata]
}

const useDeleteMetadata = (): [
  CoreTypes.Metadata | undefined,
  Dispatch<SetStateAction<CoreTypes.Metadata | undefined>>,
] => {
  const { walletConnect } = useContext(WalletConnectContext)
  const { safe } = useSafeInfo()
  const [metadata, setMetadata] = useState<CoreTypes.Metadata>()

  const onDelete = useCallback(
    ({ optionalNamespaces, requiredNamespaces, peer }: SessionTypes.Struct) => {
      const supportedEip155ChainIds = getSupportedEip155ChainIds(requiredNamespaces, optionalNamespaces)

      const eipChainId = getEip155ChainId(safe.chainId)
      const isUnsupportedChain = !supportedEip155ChainIds.includes(eipChainId)

      if (!isUnsupportedChain) {
        return
      }

      // Show success banner
      setMetadata(peer.metadata)

      return setTimeout(() => {
        setMetadata(undefined)
      }, BANNER_TIMEOUT * 2)
    },
    [safe.chainId],
  )

  useEffect(() => {
    if (!walletConnect) return

    let timeout: NodeJS.Timeout | undefined

    walletConnect.onSessionDelete((session) => {
      timeout = onDelete(session)
    })

    return () => clearTimeout(timeout)
  }, [onDelete, walletConnect])

  return [metadata, setMetadata]
}

const WalletConnectHeaderWidget = (): ReactElement => {
  const { walletConnect, setError, open, setOpen } = useContext(WalletConnectContext)
  const iconRef = useRef<HTMLDivElement>(null)
  const sessions = useWalletConnectSessions()
  const [uri, clearUri] = usePrepopulatedUri()

  const onOpenSessionManager = useCallback(() => setOpen(true), [setOpen])

  const onCloseSessionManager = useCallback(() => {
    setOpen(false)
    clearUri()
    setError(null)
  }, [setOpen, clearUri, setError])

  const [successMetadata, setSuccessMetadata] = useSuccessMetadata(onCloseSessionManager)
  const [deleteMetadata, setDeleteMetadata] = useDeleteMetadata()

  const bannerMetadata = successMetadata || deleteMetadata

  const onCloseConnectionBanner = useCallback(() => {
    setSuccessMetadata(undefined)
    setDeleteMetadata(undefined)
  }, [setDeleteMetadata, setSuccessMetadata])

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

      <Popup anchorEl={iconRef.current} open={!!bannerMetadata} onClose={onCloseConnectionBanner}>
        <ConnectionBanner metadata={bannerMetadata} isDelete={!!deleteMetadata} />
      </Popup>
    </>
  )
}

export default WalletConnectHeaderWidget
