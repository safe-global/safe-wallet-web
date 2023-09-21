import { useContext, useEffect, useState } from 'react'
import { Button } from '@mui/material'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import type { SessionTypes } from '@walletconnect/types'

import useSafeInfo from '@/hooks/useSafeInfo'
import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import ConnectionCenter from '../ConnnectionCenter'
import { asError } from '@/services/exceptions/utils'

const SessionForm = ({ anchorEl }: { anchorEl: HTMLButtonElement | null }) => {
  const { safe, safeAddress } = useSafeInfo()
  const { chainId } = safe
  const { walletConnect } = useContext(WalletConnectContext)
  const [sessions, setSessions] = useState<Record<string, SessionTypes.Struct>>({})
  const [proposal, setProposal] = useState<Web3WalletTypes.SessionProposal>()
  const [error, setError] = useState<string>()

  // Subscribe to session proposals
  useEffect(() => {
    if (!chainId || !safeAddress) {
      return
    }

    return walletConnect.addOnSessionPropose(
      chainId,
      safeAddress,
      (event) => {
        console.log('WC proposal', event)
        setProposal(event)
        return Promise.resolve(true)
      },
      (session) => {
        console.log('WC session', session)
        setSessions(walletConnect.getActiveSessions() || {})
      },
    )
  }, [walletConnect, chainId, safeAddress])

  // Set initial sessions
  useEffect(() => {
    walletConnect.init().then(() => {
      setSessions(walletConnect.getActiveSessions() || {})
    })
  }, [walletConnect])

  // Log sessions
  useEffect(() => {
    console.log('WC sessions', sessions)
  }, [sessions])

  const onDisconnect = async (session: SessionTypes.Struct) => {
    try {
      await walletConnect.disconnectSession(session)
      setSessions(walletConnect.getActiveSessions() || {})
    } catch (error) {
      setError(asError(error).message)
    }
  }

  if (proposal) {
    return <ConnectionCenter anchorEl={anchorEl} proposal={proposal} onClose={() => setProposal(undefined)} />
  }

  return (
    <>
      {error}

      <ul>
        {Object.values(sessions).map((session) => (
          <li key={session.topic}>
            {session.peer.metadata.name}
            <Button onClick={() => onDisconnect(session)}>Disconnect</Button>
          </li>
        ))}
      </ul>
    </>
  )
}

export default SessionForm
