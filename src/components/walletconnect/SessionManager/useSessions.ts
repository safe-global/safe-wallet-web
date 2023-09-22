import { useSyncExternalStore, useContext, useEffect, useCallback } from 'react'
import { memoize } from 'lodash'
import type { SessionTypes } from '@walletconnect/types'

import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import type WalletConnectWallet from '@/services/walletconnect/WalletConnectWallet'

const listeners: Set<() => void> = new Set()

const subscribe = (sessionListener: () => void) => {
  listeners.add(sessionListener)
  return () => {
    listeners.delete(sessionListener)
  }
}

const observe = () => {
  listeners.forEach((listener) => {
    listener()
  })
}

const _getSessions = memoize(
  (walletConnect: WalletConnectWallet) => walletConnect.getActiveSessions(),
  (walletConnect) => JSON.stringify(walletConnect.getActiveSessions()),
)

export function useSessions(): Record<string, SessionTypes.Struct> {
  const { walletConnect } = useContext(WalletConnectContext)

  const getSessions = useCallback(() => {
    return _getSessions(walletConnect)
  }, [walletConnect])

  useEffect(() => {
    return walletConnect.onSessionPropose(observe)
  }, [walletConnect])

  useEffect(() => {
    return walletConnect.onSessionRequest(observe)
  }, [walletConnect])

  useEffect(() => {
    return walletConnect.onSessionDelete(observe)
  }, [walletConnect])

  return useSyncExternalStore(subscribe, getSessions, getSessions)
}
