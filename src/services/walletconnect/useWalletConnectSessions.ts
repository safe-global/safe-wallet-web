import { useContext, useEffect, useCallback, useState } from 'react'
import type { SessionTypes } from '@walletconnect/types'
import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'

function useWalletConnectSessions(): SessionTypes.Struct[] {
  const { walletConnect } = useContext(WalletConnectContext)
  const [sessions, setSessions] = useState<SessionTypes.Struct[]>([])

  const updateSessions = useCallback(() => {
    setSessions(walletConnect.getActiveSessions())
  }, [walletConnect])

  // Initial sessions
  useEffect(updateSessions, [updateSessions])

  // On session add
  useEffect(() => {
    return walletConnect.onSessionAdd(updateSessions)
  }, [walletConnect, updateSessions])

  // On session delete
  useEffect(() => {
    return walletConnect.onSessionDelete(updateSessions)
  }, [walletConnect, updateSessions])

  return sessions
}

export default useWalletConnectSessions
