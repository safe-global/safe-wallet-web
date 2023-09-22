import { useCallback, useContext, useEffect, useState } from 'react'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import type { SessionTypes } from '@walletconnect/types'

import useSafeInfo from '@/hooks/useSafeInfo'
import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import { asError } from '@/services/exceptions/utils'
import ProposalForm from '../ProposalForm'
import WcInput from '../WcInput'
import ErrorMessage from '@/components/tx/ErrorMessage'
import SessionList from '../SessionList'
import Popup from '../Popup'

const SessionManager = ({ anchorEl, open, onClose }: { anchorEl: Element; open: boolean; onClose: () => void }) => {
  const { safe, safeAddress } = useSafeInfo()
  const { chainId } = safe
  const { walletConnect, error: walletConnectError } = useContext(WalletConnectContext)
  const [sessions, setSessions] = useState<Record<string, SessionTypes.Struct>>(walletConnect.getActiveSessions())
  const [proposal, setProposal] = useState<Web3WalletTypes.SessionProposal>()
  const [error, setError] = useState<Error>()

  // Subscribe to session proposals
  useEffect(() => {
    return walletConnect.onSessionPropose(setProposal)
  }, [walletConnect])

  // Subscribe to session deletes
  useEffect(() => {
    return walletConnect.onSessionDelete(() => {
      setSessions(walletConnect.getActiveSessions())
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
    setSessions(walletConnect.getActiveSessions())
  }, [proposal, walletConnect, chainId, safeAddress])

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
      setSessions(walletConnect.getActiveSessions())
    } catch (error) {
      setError(asError(error))
    }
  }

  return (
    <Popup
      anchorEl={anchorEl}
      open={open}
      onClose={async () => {
        await onReject()
        onClose()
      }}
    >
      {error && (
        <ErrorMessage error={error}>Error establishing connection with WalletConnect. Please try again.</ErrorMessage>
      )}

      {walletConnectError && <ErrorMessage error={walletConnectError}>Error with WalletConnect request.</ErrorMessage>}

      {proposal ? (
        <ProposalForm proposal={proposal} onApprove={onApprove} onReject={onReject} />
      ) : (
        <>
          <WcInput />

          <SessionList sessions={sessions} onDisconnect={onDisconnect} />
        </>
      )}
    </Popup>
  )
}

export default SessionManager
