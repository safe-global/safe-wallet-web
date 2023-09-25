import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import type { SessionTypes } from '@walletconnect/types'

import useSafeInfo from '@/hooks/useSafeInfo'
import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import useWalletConnectSessions from '@/services/walletconnect/useWalletConnectSessions'
import { asError } from '@/services/exceptions/utils'
import ProposalForm from '../ProposalForm'
import WcInput from '../WcInput'
import ErrorMessage from '@/components/tx/ErrorMessage'
import SessionList from '../SessionList'
import useWallet from '@/hooks/wallets/useWallet'
import { selectOwnedSafes } from '@/store/addedSafesSlice'
import { useAppSelector } from '@/store'

const SessionManager = () => {
  const { safe, safeAddress } = useSafeInfo()
  const { chainId } = safe
  const wallet = useWallet()
  const ownedSafes = useAppSelector((state) => selectOwnedSafes(state, wallet?.address))
  const { walletConnect, error: walletConnectError } = useContext(WalletConnectContext)
  const sessions = useWalletConnectSessions()
  const [proposal, setProposal] = useState<Web3WalletTypes.SessionProposal>()
  const [error, setError] = useState<Error>()

  // Subscribe to session proposals
  useEffect(() => {
    return walletConnect.onSessionPropose(setProposal)
  }, [walletConnect])

  // On session approve
  const onApprove = useCallback(async () => {
    if (!chainId || !safeAddress || !proposal) return

    try {
      await walletConnect.approveSession(proposal, chainId, safeAddress, ownedSafes)
    } catch (e) {
      setError(asError(e))
      return
    }

    setProposal(undefined)
  }, [proposal, walletConnect, chainId, safeAddress, ownedSafes])

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
    } catch (error) {
      setError(asError(error))
    }
  }

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
