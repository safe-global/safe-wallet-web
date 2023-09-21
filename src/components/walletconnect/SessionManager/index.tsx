import { useCallback, useContext, useEffect, useState } from 'react'
import { Button } from '@mui/material'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import type { SessionTypes } from '@walletconnect/types'

import useSafeInfo from '@/hooks/useSafeInfo'
import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import { asError } from '@/services/exceptions/utils'
import ProposalForm from '../ProposalForm'
import WcInput from '../WcInput'
import ErrorMessage from '@/components/tx/ErrorMessage'

const SessionManager = () => {
  const { safe, safeAddress } = useSafeInfo()
  const { chainId } = safe
  const { walletConnect } = useContext(WalletConnectContext)
  const [sessions, setSessions] = useState<Record<string, SessionTypes.Struct>>(walletConnect.getActiveSessions() || {})
  const [proposal, setProposal] = useState<Web3WalletTypes.SessionProposal>()
  const [error, setError] = useState<Error>()

  // Subscribe to session proposals
  useEffect(() => {
    return walletConnect.addOnSessionPropose(async (event) => {
      setProposal(event)
    })
  }, [walletConnect])

  // On session approve
  const onApprove = useCallback(async () => {
    if (!chainId || !safeAddress || !proposal) return

    try {
      await walletConnect.approveSession(proposal, chainId, safeAddress)
    } catch (e) {
      setError(asError(e))
      return
    }

    setProposal(undefined)
    // Update sessions
    setSessions(walletConnect.getActiveSessions() || {})
  }, [proposal, walletConnect])

  // On session reject
  const onReject = useCallback(async () => {
    if (!proposal) return

    try {
      await walletConnect.rejectSession(proposal)
    } catch (e) {
      setError(asError(e))
      return
    }

    setProposal(undefined)
  }, [proposal, walletConnect])

  // On session disconnect
  const onDisconnect = async (session: SessionTypes.Struct) => {
    try {
      await walletConnect.disconnectSession(session)
      setSessions(walletConnect.getActiveSessions() || {})
    } catch (error) {
      setError(asError(error))
    }
  }

  return (
    <>
      {error && (
        <ErrorMessage error={error}>Error establishing connection with WalletConnect. Please try again.</ErrorMessage>
      )}

      {proposal ? (
        <ProposalForm proposal={proposal} onApprove={onApprove} onReject={onReject} />
      ) : (
        <>
          <WcInput />
          <ul>
            {Object.values(sessions).map((session) => (
              <li key={session.topic}>
                {session.peer.metadata.name}
                <Button onClick={() => onDisconnect(session)}>Disconnect</Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

export default SessionManager
