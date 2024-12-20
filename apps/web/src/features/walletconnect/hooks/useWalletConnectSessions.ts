import { useContext, useEffect, useCallback, useState } from 'react'
import type { SessionTypes } from '@walletconnect/types'
import { WalletConnectContext } from '@/features/walletconnect/WalletConnectContext'

function useWalletConnectSessions(): SessionTypes.Struct[] {
  const { walletConnect } = useContext(WalletConnectContext)
  const [sessions, setSessions] = useState<SessionTypes.Struct[]>([])

  const updateSessions = useCallback(() => {
    if (!walletConnect) return
    setSessions(walletConnect.getActiveSessions())
  }, [walletConnect])

  // Initial sessions
  useEffect(updateSessions, [updateSessions])

  // On session add
  useEffect(() => {
    if (!walletConnect) return
    return walletConnect.onSessionAdd(updateSessions)
  }, [walletConnect, updateSessions])

  // On session delete
  useEffect(() => {
    if (!walletConnect) return
    return walletConnect.onSessionDelete(updateSessions)
  }, [walletConnect, updateSessions])

  return sessions
}

export default useWalletConnectSessions
