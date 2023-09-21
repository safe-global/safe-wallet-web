import { forwardRef, useContext, useEffect, useState } from 'react'
import { type Web3WalletTypes } from '@walletconnect/web3wallet'
import { SessionTypes } from '@walletconnect/types'
import useSafeInfo from '@/hooks/useSafeInfo'
import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import ConnectionCenter from '../ConnnectionCenter'

const SessionForm = forwardRef<HTMLButtonElement>((_, ref) => {
  const { safe, safeAddress } = useSafeInfo()
  const { chainId } = safe
  const { walletConnect } = useContext(WalletConnectContext)
  const [sessions, setSessions] = useState<Record<string, SessionTypes.Struct>>({})
  const [proposal, setProposal] = useState<Web3WalletTypes.SessionProposal>()

  useEffect(() => {
    if (!chainId || !safeAddress) {
      return
    }

    walletConnect.addOnSessionPropose(
      chainId,
      safeAddress,
      (event) => {
        console.log('WC proposal', event)
        setProposal(event)
        return Promise.resolve(true)
      },
      (session) => {
        console.log('WC session', session)
        const allSessions = walletConnect.getActiveSessions()
        setSessions(allSessions || {})
      },
    )
  }, [walletConnect, chainId, safeAddress])

  useEffect(() => {
    walletConnect.init().then(() => {
      const allSessions = walletConnect.getActiveSessions()
      setSessions(allSessions || {})
    })
  }, [walletConnect])

  useEffect(() => {
    console.log('WC sessions', sessions)
  }, [sessions])

  if (proposal) {
    return <ConnectionCenter ref={ref} proposal={proposal} onClose={() => setProposal(undefined)} />
  }

  return <></>
})

SessionForm.displayName = 'SessionForm'

export default SessionForm
