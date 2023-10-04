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
import { useWalletConnectSearchParamUri } from '@/services/walletconnect/useWalletConnectSearchParamUri'

const SessionManager = ({ sessions }: { sessions: SessionTypes.Struct[] }) => {
  const { safe, safeAddress } = useSafeInfo()
  const { chainId } = safe
  const { walletConnect, error: walletConnectError } = useContext(WalletConnectContext)
  const [wcUri, setWcUri] = useWalletConnectSearchParamUri()
  const [proposal, setProposal] = useState<Web3WalletTypes.SessionProposal>()
  const [error, setError] = useState<Error>()

  // On session approve
  const onApprove = useCallback(async () => {
    if (!walletConnect || !chainId || !safeAddress || !proposal) return

    try {
      await walletConnect.approveSession(proposal, chainId, safeAddress)
    } catch (e) {
      setError(asError(e))
      return
    }

    setWcUri(null)
    setProposal(undefined)
  }, [walletConnect, chainId, safeAddress, proposal, setWcUri])

  // On session reject
  const onReject = useCallback(async () => {
    if (!walletConnect || !proposal) return

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
    if (!walletConnect) return
    try {
      await walletConnect.disconnectSession(session)
    } catch (error) {
      setError(asError(error))
    }
  }

  // Subscribe to session proposals
  useEffect(() => {
    if (!walletConnect) return
    return walletConnect.onSessionPropose(setProposal)
  }, [walletConnect])

  // Connect to session present in URL
  useEffect(() => {
    if (!walletConnect || !wcUri) return

    walletConnect.connect(wcUri).catch(setError)
  }, [walletConnect, wcUri])

  return (
    <>
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
    </>
  )
}

export default SessionManager
