import { useCallback, useContext, useEffect, useState } from 'react'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import type { SessionTypes } from '@walletconnect/types'
import { WalletConnectContext } from '@/features/walletconnect/WalletConnectContext'
import WcConnectionForm from '../WcConnectionForm'
import WcErrorMessage from '../WcErrorMessage'
import WcProposalForm from '../WcProposalForm'
import { trackEvent } from '@/services/analytics'
import { WALLETCONNECT_EVENTS } from '@/services/analytics/events/walletconnect'
import { splitError } from '@/features/walletconnect/services/utils'

type WcSessionManagerProps = {
  sessions: SessionTypes.Struct[]
  uri: string
}

const WcSessionManager = ({ sessions, uri }: WcSessionManagerProps) => {
  const { walletConnect, error, setError, open } = useContext(WalletConnectContext)
  const [proposal, setProposal] = useState<Web3WalletTypes.SessionProposal>()

  // Reset error
  const onErrorReset = useCallback(() => {
    setError(null)
  }, [setError])

  // Subscribe to session proposals
  useEffect(() => {
    if (!walletConnect) return
    return walletConnect.onSessionPropose((proposalData) => {
      setError(null)
      setProposal(proposalData)
    })
  }, [walletConnect, setError])

  // Track errors
  useEffect(() => {
    if (error) {
      // The summary of the error
      const label = splitError(error.message || '')[0]
      trackEvent({ ...WALLETCONNECT_EVENTS.SHOW_ERROR, label })
    }
  }, [error])

  // Nothing to show
  if (!open) return null

  // Error
  if (error) {
    return <WcErrorMessage error={error} onClose={onErrorReset} />
  }

  // Session proposal
  if (proposal) {
    return <WcProposalForm proposal={proposal} setProposal={setProposal} />
  }

  // Connection form (initial state)
  return <WcConnectionForm sessions={sessions} uri={uri} />
}

export default WcSessionManager
