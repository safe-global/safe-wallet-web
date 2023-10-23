import { useCallback, useContext, useEffect, useState } from 'react'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import type { SessionTypes } from '@walletconnect/types'
import useSafeInfo from '@/hooks/useSafeInfo'
import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import { asError } from '@/services/exceptions/utils'
import WcConnectionForm from '../WcConnectionForm'
import WcErrorMessage from '../WcErrorMessage'
import WcProposalForm from '../WcProposalForm'
import WcConnectionState from '../WcConnectionState'

type WcSessionManagerProps = {
  sessions: SessionTypes.Struct[]
  uri: string
}

const SESSION_INFO_TIMEOUT = 2000

const WcSessionManager = ({ sessions, uri }: WcSessionManagerProps) => {
  const { safe, safeAddress } = useSafeInfo()
  const { chainId } = safe
  const { walletConnect, error: walletConnectError, setOpen } = useContext(WalletConnectContext)
  const [proposal, setProposal] = useState<Web3WalletTypes.SessionProposal>()
  const [error, setError] = useState<Error | undefined>()
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
    return walletConnect.onSessionPropose((proposalData) => {
      setError(undefined)
      setProposal(proposalData)
    })
  }, [walletConnect])

  // On session add
  useEffect(() => {
    return walletConnect?.onSessionAdd(setChangedSession)
  }, [walletConnect])

  // On session delete
  useEffect(() => {
    return walletConnect?.onSessionDelete(setChangedSession)
  }, [walletConnect])

  // Hide session info after timeout
  useEffect(() => {
    if (!changedSession) return

    setOpen(true)

    let timer = setTimeout(() => {
      setOpen(false)

      timer = setTimeout(() => {
        setChangedSession(undefined)
      }, 500)
    }, SESSION_INFO_TIMEOUT)

    return () => clearTimeout(timer)
  }, [changedSession, setOpen])

  //
  // UI states
  //

  // Error
  const anyError = walletConnectError || error
  if (anyError) {
    return <WcErrorMessage error={anyError} />
  }

  // Session proposal
  if (proposal) {
    return <WcProposalForm proposal={proposal} onApprove={onApprove} onReject={onReject} />
  }

  // Session info
  if (changedSession) {
    return (
      <WcConnectionState
        metadata={changedSession.peer?.metadata}
        isDelete={!sessions.some((s) => s.topic === changedSession.topic)}
      />
    )
  }

  // Connection form (initial state)
  return <WcConnectionForm sessions={sessions} onDisconnect={onDisconnect} uri={uri} />
}

export default WcSessionManager
