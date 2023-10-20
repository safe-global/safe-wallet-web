import { useCallback, useContext, useEffect, useState } from 'react'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import type { SessionTypes } from '@walletconnect/types'
import type { ReactElement } from 'react'

import useSafeInfo from '@/hooks/useSafeInfo'
import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import { asError } from '@/services/exceptions/utils'
import WcConnectionForm from '../WcConnectionForm'
import WcErrorMessage from '../WcErrorMessage'
import usePrepopulatedUri from './usePrepopulatedUri'
import WcProposalForm from '../WcProposalForm'
import WcConnectionState from '../WcConnectionState'

type WcSessionManagerProps = {
  sessions: SessionTypes.Struct[]
}

const SESSION_INFO_TIMEOUT = 3000

const WcSessionManager = ({ sessions }: WcSessionManagerProps): ReactElement => {
  const { safe, safeAddress } = useSafeInfo()
  const { chainId } = safe
  const { walletConnect, error: walletConnectError } = useContext(WalletConnectContext)
  const [proposal, setProposal] = useState<Web3WalletTypes.SessionProposal>()
  const [error, setError] = useState<Error>()
  const [uri, clearUri] = usePrepopulatedUri()
  const [changedSession, setChangedSession] = useState<SessionTypes.Struct>()

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
  const onDisconnect = useCallback(
    async (session: SessionTypes.Struct) => {
      if (!walletConnect) return
      try {
        await walletConnect.disconnectSession(session)
      } catch (error) {
        setError(asError(error))
      }
    },
    [walletConnect],
  )

  // Subscribe to session proposals
  useEffect(() => {
    if (!walletConnect) return
    setChangedSession(undefined)
    setError(undefined)
    return walletConnect.onSessionPropose(setProposal)
  }, [walletConnect])

  // On session add
  useEffect(() => {
    return walletConnect?.onSessionAdd(setChangedSession)
  }, [walletConnect])

  // On session delete
  useEffect(() => {
    return walletConnect?.onSessionDelete(setChangedSession)
  }, [walletConnect])

  // Clear prepopulated uri on unmount
  useEffect(() => {
    return () => clearUri()
  }, [clearUri])

  // Clear changed session after 3 seconds
  useEffect(() => {
    if (!changedSession) return
    const timer = setTimeout(() => {
      setChangedSession(undefined)
    }, SESSION_INFO_TIMEOUT)
    return () => clearTimeout(timer)
  }, [changedSession])

  //
  // UI states
  //

  // Error
  const anyError = walletConnectError || error
  if (anyError) {
    return <WcErrorMessage error={anyError} />
  }

  // Session info
  if (changedSession) {
    return <WcConnectionState metadata={changedSession.peer.metadata} />
  }

  // Session proposal
  if (proposal) {
    return <WcProposalForm proposal={proposal} onApprove={onApprove} onReject={onReject} />
  }

  // Connection form (initial state)
  return <WcConnectionForm sessions={sessions} onDisconnect={onDisconnect} uri={uri} />
}

export default WcSessionManager
