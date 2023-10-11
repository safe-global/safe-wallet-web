import { useCallback, useContext, useEffect, useState } from 'react'
import { Typography } from '@mui/material'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import type { SessionTypes } from '@walletconnect/types'
import type { ReactElement } from 'react'

import useSafeInfo from '@/hooks/useSafeInfo'
import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import { asError } from '@/services/exceptions/utils'
import ProposalForm from '../ProposalForm'
import { ConnectionForm } from '../ConnectionForm'
import { WalletConnectHeader } from './Header'

const SessionManager = ({ sessions }: { sessions: SessionTypes.Struct[] }): ReactElement => {
  const { safe, safeAddress } = useSafeInfo()
  const { chainId } = safe
  const { walletConnect, error: walletConnectError } = useContext(WalletConnectContext)
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

    setProposal(undefined)
  }, [walletConnect, chainId, safeAddress, proposal])

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

  if (walletConnectError || error) {
    return (
      <>
        <WalletConnectHeader error />
        <Typography>{walletConnectError?.message ?? error?.message}</Typography>
      </>
    )
  }

  if (!proposal) {
    return <ConnectionForm sessions={sessions} onDisconnect={onDisconnect} />
  }

  return <ProposalForm proposal={proposal} onApprove={onApprove} onReject={onReject} />
}

export default SessionManager
